import { Readable } from 'node:stream'
import { defineConfig, loadEnv } from 'vite'
import { createSuggestionHandler, generateRemotely } from './server/contractSuggestions.js'
import { generateLocally } from './server/localOpenCode.js'

export default defineConfig(({ mode }) => ({
  plugins: [{
    name: 'mox-contract-suggestions',
    configureServer(server) {
      const { OPENCODE_API_KEY } = loadEnv(mode, process.cwd(), 'OPENCODE_')
      const generate = process.env.OPENCODE_SERVER_URL ? generateRemotely : input => generateLocally(input, OPENCODE_API_KEY)
      const handler = createSuggestionHandler(generate)
      server.middlewares.use('/api/clauses', async (request, response, next) => {
        if (request.url !== '/') return next()
        try {
          const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
          const result = await handler(new Request(`http://${request.headers.host}/api/clauses`, {
            method: request.method,
            headers: request.headers,
            ...(hasBody && { body: Readable.toWeb(request), duplex: 'half' }),
          }))
          response.writeHead(result.status, Object.fromEntries(result.headers))
          response.end(await result.text())
        } catch (error) {
          next(error)
        }
      })
    },
  }],
}))
