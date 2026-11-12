import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { generationError, generationPath } from './contractSuggestions.js'

const run = promisify(execFile)
const require = createRequire(import.meta.url)

export async function generateLocally(input, key) {
  if (!key) throw new Error('OpenCode is not configured')
  const platform = process.platform === 'win32' ? 'windows' : process.platform
  const install = require.resolve(`@opencode/cli-${platform}-${process.arch}/package.json`)
  const binary = join(dirname(install), 'bin', process.platform === 'win32' ? 'opencode.exe' : 'opencode')
  const cwd = await mkdtemp(join(tmpdir(), 'mox-clauses-'))
  try {
    const config = join(cwd, 'opencode.json')
    await writeFile(config, JSON.stringify({
      permissions: [{ action: '*', resource: '*', effect: 'deny' }],
    }))
    const { stdout } = await run(binary, ['api', '--standalone', 'post', generationPath, '-d', JSON.stringify(input)], {
      cwd,
      windowsHide: true,
      maxBuffer: 128 * 1024,
      timeout: 48000,
      env: {
        ...process.env,
        OPENCODE_CONFIG: config,
        OPENCODE_CONFIG_DIR: cwd,
        OPENCODE_CONFIG_CONTENT: '',
        OPENCODE_API_KEY: key,
        XDG_CONFIG_HOME: join(cwd, 'config'),
        XDG_DATA_HOME: join(cwd, 'data'),
        XDG_STATE_HOME: join(cwd, 'state'),
        XDG_CACHE_HOME: join(cwd, 'cache'),
      },
    })
    return JSON.parse(stdout)
  } catch (error) {
    let result
    try { result = JSON.parse(error.stdout || error.stderr) } catch { /* No structured provider error. */ }
    throw generationError(result)
  } finally {
    await rm(cwd, { recursive: true, force: true, maxRetries: 2 }).catch(() => {})
  }
}
