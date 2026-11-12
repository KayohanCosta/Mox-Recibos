import { isContract, templateById } from '../src/templates.js'

const model = { providerID: 'opencode', id: 'minimax-m3.1-flash-free' }
export const generationPath = '/api/experimental/generate/text'
const cacheLifetime = 12 * 60 * 60 * 1000

function generationInput(template) {
  return {
    model,
    prompt: [
      'Escreva três sugestões preliminares de cláusulas em português do Brasil, para revisão do usuário.',
      `Modelo: ${template.name}. Finalidade: ${template.description}`,
      'Use títulos específicos e um parágrafo curto por cláusula. Evite repetir o escopo já exibido no modelo.',
      'Não invente nomes, datas, preços, multas, leis ou obrigações já acordadas. Use [a definir] se faltar informação essencial.',
      'Não alegue validade ou suficiência jurídica. Responda somente com um array JSON: [{"title":"Título","text":"Texto"}].',
    ].join('\n'),
  }
}

function parseSuggestions(result) {
  const output = result?.text ?? result?.data?.text
  if (typeof output !== 'string' || output.length > 12000) throw new Error('Invalid response')
  const parsed = JSON.parse(output.trim().replace(/^\x60\x60\x60(?:json)?\s*|\s*\x60\x60\x60$/gi, ''))
  if (!Array.isArray(parsed) || !parsed.length || parsed.length > 5) throw new Error('Invalid suggestions')

  return parsed.map(entry => {
    const title = typeof entry?.title === 'string' ? entry.title.trim() : ''
    const text = typeof entry?.text === 'string' ? entry.text.trim() : ''
    if (!title || !text || title.length > 100 || text.length > 1400) throw new Error('Invalid clause')
    return { title, text }
  })
}

function starterClauses(template) {
  return [
    { title: 'Escopo e responsabilidades', text: 'As partes descrevem neste contrato as atividades acordadas e indicam quem responde por cada etapa: [detalhar].' },
    { title: 'Prazos e comunicação', text: 'As partes registram as datas ou etapas combinadas e o canal para comunicar mudanças: [detalhar].' },
    { title: 'Conferência do cumprimento', text: `As partes registram como será feita a conferência de ${template.details?.items.toLocaleLowerCase('pt-BR') ?? 'serviços, bens ou entregas'}: [detalhar critérios e responsáveis].` },
  ]
}

export function generationError(result) {
  const retryAfter = Number(result?.retryAfterMs)
  return Object.assign(new Error('OpenCode is unavailable'), {
    retryAfterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60000,
  })
}

export function createSuggestionHandler(generate) {
  const cache = new Map()
  const pending = new Map()
  let retryAt = 0

  const reply = (data, status = 200, headers = {}) =>
    Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

  return async request => {
    if (request.method !== 'POST') return reply({ error: 'Método não permitido.' }, 405, { Allow: 'POST' })
    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(request.url).origin) return reply({ error: 'Origem não permitida.' }, 403)
    if (Number(request.headers.get('content-length')) > 512) return reply({ error: 'Solicitação muito longa.' }, 413)

    let type
    try {
      const raw = await request.text()
      if (raw.length > 512) return reply({ error: 'Solicitação muito longa.' }, 413)
      type = JSON.parse(raw)?.type
    } catch {
      return reply({ error: 'Solicitação inválida.' }, 400)
    }
    const template = typeof type === 'string' && Object.hasOwn(templateById, type) ? templateById[type] : null
    if (!template || !isContract(template)) return reply({ error: 'Selecione um modelo de contrato.' }, 400)

    const saved = cache.get(type)
    if (saved && saved.expires > Date.now()) return reply({ clauses: saved.clauses })
    if (retryAt > Date.now()) return reply({ clauses: starterClauses(template) })

    let task = pending.get(type)
    if (!task) {
      if (pending.size >= 3) return reply({ clauses: starterClauses(template) })
      task = Promise.resolve().then(async () => {
        const clauses = parseSuggestions(await generate(generationInput(template)))
        cache.set(type, { clauses, expires: Date.now() + cacheLifetime })
        return clauses
      }).finally(() => pending.delete(type))
      pending.set(type, task)
    }

    try {
      return reply({ clauses: await task })
    } catch (error) {
      retryAt = Date.now() + (error.retryAfterMs ?? 60000)
      return reply({ clauses: starterClauses(template) })
    }
  }
}

export async function generateRemotely(input) {
  const base = process.env.OPENCODE_SERVER_URL
  const password = process.env.OPENCODE_PASSWORD
  if (!base || !password) throw new Error('OpenCode server is not configured')
  const url = new URL(generationPath, base)
  if (url.protocol !== 'https:') throw new Error('OpenCode server must use HTTPS')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    redirect: 'error',
    signal: AbortSignal.timeout(45000),
  })
  if (!response.ok) throw generationError(await response.json().catch(() => null))
  return response.json()
}
