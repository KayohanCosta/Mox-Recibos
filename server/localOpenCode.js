import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { generateWithOpenCode } from './contractSuggestions.js'

const require = createRequire(import.meta.url)

function listeningAddress(child) {
  return new Promise((resolve, reject) => {
    let output = ''
    const timeout = setTimeout(() => finish(new Error('OpenCode startup timed out')), 12000)
    const onError = () => finish(new Error('Could not start OpenCode'))
    const onData = chunk => {
      output = (output + chunk).slice(-2048)
      const match = output.match(/listening on (http:\/\/127\.0\.0\.1:\d+)/i)
      if (match) finish(null, match[1])
    }
    function finish(error, address) {
      clearTimeout(timeout)
      child.stdout.off('data', onData)
      child.off('close', onError)
      child.off('error', onError)
      if (error) reject(error)
      else resolve(address)
    }
    child.stdout.on('data', onData)
    child.once('close', onError)
    child.once('error', onError)
  })
}

export async function generateLocally(input, key) {
  if (!key) throw new Error('OpenCode is not configured')
  const platform = process.platform === 'win32' ? 'windows' : process.platform
  const install = require.resolve(`@opencode/cli-${platform}-${process.arch}/package.json`)
  const binary = join(dirname(install), 'bin', process.platform === 'win32' ? 'opencode.exe' : 'opencode')
  const cwd = await mkdtemp(join(tmpdir(), 'mox-clauses-'))
  let child, closed
  try {
    const config = join(cwd, 'opencode.json')
    await writeFile(config, JSON.stringify({
      permissions: [{ action: '*', resource: '*', effect: 'deny' }],
    }))
    const password = randomBytes(24).toString('hex')
    child = spawn(binary, ['serve', '--hostname', '127.0.0.1', '--port', '0'], {
      cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore'],
      env: {
        ...process.env,
        OPENCODE_CONFIG: config,
        OPENCODE_CONFIG_DIR: cwd,
        OPENCODE_CONFIG_CONTENT: '',
        OPENCODE_API_KEY: key,
        OPENCODE_PASSWORD: password,
        XDG_CONFIG_HOME: join(cwd, 'config'),
        XDG_DATA_HOME: join(cwd, 'data'),
        XDG_STATE_HOME: join(cwd, 'state'),
        XDG_CACHE_HOME: join(cwd, 'cache'),
      },
    })
    closed = once(child, 'close').catch(() => {})
    const url = await listeningAddress(child)
    return await generateWithOpenCode(input, url, password)
  } finally {
    child?.kill()
    await closed
    await rm(cwd, { recursive: true, force: true, maxRetries: 2 }).catch(() => {})
  }
}
