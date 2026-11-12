import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { categories, templates } from '../src/templates.js'
import { createSuggestionHandler, generationError } from '../server/contractSuggestions.js'

const wcag = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function checkEditorAccessibility(page) {
  // The printed document has legacy colors and typography that must be preserved.
  const result = await new AxeBuilder({ page }).exclude('.paper').withTags(wcag).analyze()
  expect(result.violations).toEqual([])
}

test('searches, filters and opens models in the expanded library', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Mox Recibos/)
  await expect(page.getByRole('link', { name: 'Mox Recibos' })).toBeVisible()
  await expect(page.locator('.model-card')).toHaveCount(76)
  await checkEditorAccessibility(page)
  const search = page.getByRole('searchbox', { name: 'Buscar modelos' })
  await search.fill('locacao inexistente')
  await expect(page.getByRole('status')).toHaveText('Nenhum modelo encontrado.')
  await search.fill('mensalidade escolar')
  await expect(page.locator('.model-card')).toHaveCount(1)
  await expect(page.locator('.model-card')).toContainText('Recibo de mensalidade escolar')
  await search.fill('CAUCAO')
  await expect(page.locator('.model-card')).toHaveCount(1)
  await expect(page.locator('.model-card')).toContainText('Recibo de caução')
  await search.clear()
  const category = page.getByRole('combobox', { name: 'Categoria' })
  await category.selectOption('hospedagem')
  await expect(page.locator('.model-card')).toHaveCount(5)
  await category.selectOption('servicos')
  await expect(page.locator('.model-card')).toHaveCount(7)
  await page.getByRole('button', { name: 'Ordem de serviço' }).click()
  await expect(page.getByRole('heading', { name: 'Ordem de serviço', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Documento', exact: true }).click()
  await expect(page.getByLabel('Tipo de documento')).toHaveValue('ordem-servico')
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Modelos de documentos' })).toBeFocused()
})

test('validates fields and restores the draft with items and logo', async ({ page }) => {
  await page.goto('/#editor')
  await page.getByLabel('Nome da empresa').fill('Estúdio Almeida')
  const email = page.getByLabel('E-mail')
  await email.fill('invalido')
  await email.press('Tab')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
  await checkEditorAccessibility(page)
  await email.fill('contato@example.com')
  await expect(email).not.toHaveAttribute('aria-invalid', 'true')
  await page.getByLabel('Selecionar imagem').setInputFiles({
    name: 'logo.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="green"/></svg>'),
  })
  await expect(page.getByRole('img', { name: 'Logo da empresa' })).toBeVisible()
  await page.getByRole('button', { name: 'Itens', exact: true }).click()
  await page.getByLabel('Descrição').fill('Consultoria')
  await page.getByLabel('Quantidade').fill('2')
  await page.getByLabel('Valor (BRL)').fill('75.5')
  await page.getByRole('button', { name: 'Adicionar item' }).click()
  await page.getByRole('group', { name: 'Item 2' }).getByLabel('Descrição').fill('Suporte')
  await expect(page.locator('.grand-total')).toContainText(/R\$\s*151,00/)
  await expect(page.getByText('Rascunho salvo neste navegador')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Nome da empresa')).toHaveValue('Estúdio Almeida')
  await expect(page.getByRole('img', { name: 'Logo da empresa' })).toBeVisible()
  await page.getByRole('button', { name: 'Remover logo' }).click()
  await expect(page.getByRole('img', { name: 'Logo da empresa' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Itens', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Item 2' }).getByLabel('Descrição')).toHaveValue('Suporte')
  await page.getByRole('button', { name: 'Remover item 2' }).click()
  await expect(page.getByRole('group', { name: 'Item 2' })).toHaveCount(0)
})

for (const width of [320, 768, 1440]) {
  test(`preview responds to keyboard and zoom at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#editor')
    await expect(page.getByRole('heading', { name: 'Dados da empresa' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await checkEditorAccessibility(page)
    if (width < 880) {
      const view = page.getByRole('group', { name: 'Visualização do editor' })
      await expect(page.getByRole('region', { name: 'Pré-visualização', exact: true })).toHaveCount(0)
      await page.getByLabel('Nome da empresa').fill('Estúdio Almeida')
      await view.getByRole('button', { name: 'Prévia', exact: true }).click()
      await expect(page.getByRole('region', { name: 'Área de visualização do documento' })).toBeFocused()
      await expect(page.getByLabel('Nome da empresa')).toBeHidden()
      await expect(page.getByRole('region', { name: 'Pré-visualização', exact: true }).getByText('Estúdio Almeida').first()).toBeVisible()
      await view.getByRole('button', { name: 'Editar', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Dados da empresa' })).toBeFocused()
      await expect(page.getByLabel('Nome da empresa')).toHaveValue('Estúdio Almeida')
      await view.getByRole('button', { name: 'Prévia', exact: true }).click()
      await checkEditorAccessibility(page)
    } else {
      await expect(page.getByRole('group', { name: 'Visualização do editor' })).toHaveCount(0)
      await expect(page.getByRole('region', { name: 'Pré-visualização', exact: true })).toBeVisible()
    }
    const zoom = page.getByRole('button', { name: /Ajustar à largura/ })
    const initialZoom = await zoom.innerText()
    await page.getByRole('button', { name: 'Aumentar zoom' }).click()
    await expect(zoom).not.toHaveText(initialZoom)
    await zoom.click()
    await expect(zoom).toHaveText(initialZoom)
    const expand = page.getByRole('button', { name: 'Expandir pré-visualização' })
    await expand.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Pré-visualização' })
    await expect(dialog).toBeVisible()
    await checkEditorAccessibility(page)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(expand).toBeFocused()
  })
}

test('keeps the editor usable when browser storage fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { value: undefined })
  })
  await page.goto('/#editor')
  await expect(page.getByRole('status')).toContainText('rascunho está indisponível')
  await page.getByLabel('Nome da empresa').fill('Estúdio Almeida')
  await expect(page.getByLabel('Nome da empresa')).toHaveValue('Estúdio Almeida')
  await expect(page.getByRole('region', { name: 'Pré-visualização', exact: true })).toContainText('Estúdio Almeida')
})

const pdfModels = [
  ['Recibo', 'recibo'],
  ['Fatura', 'fatura'],
  ['Proposta comercial', 'proposta'],
  ['Recibo de reembolso', 'reembolso', 'Despesas reembolsadas', true],
  ['Comprovante de entrega', 'comprovante-entrega', 'Itens entregues', false],
  ['Relatório de serviços', 'relatorio-servicos', 'Atividades realizadas', false],
  ['Pedido de compra', 'pedido-compra', 'Produtos solicitados', true],
  ['Proposta de patrocínio', 'proposta-patrocinio', 'Cotas e contrapartidas', true],
  ['Confirmação de reserva de hospedagem', 'confirmacao-reserva-hospedagem', 'Acomodações reservadas', false],
  ['Demonstrativo de despesas de transporte', 'demonstrativo-despesas-transporte', 'Despesas de transporte', true],
  ['Orçamento de fotografia', 'orcamento-fotografia', 'Sessões e entregas', true],
]

for (const [name, type, itemHeading, hasPrices] of pdfModels) {
  test(`downloads the PDF for ${name}`, async ({ page }) => {
    await page.goto('/')
    await page.locator('.model-card').filter({ has: page.getByText(name, { exact: true }) }).click()
    await page.getByRole('button', { name: 'Documento', exact: true }).click()
    await page.getByLabel('Número do documento').fill('QA-100')
    if (itemHeading) {
      const preview = page.getByRole('region', { name: 'Pré-visualização', exact: true })
      await expect(page.getByLabel('Forma de pagamento')).toHaveCount(hasPrices ? 1 : 0)
      await page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name: 'Itens', exact: true }).click()
      await expect(page.locator('#section-heading')).toHaveText(itemHeading)
      await page.getByLabel('Descrição').fill('Item para conferência')
      await expect(preview.getByText('Item para conferência')).toBeVisible()
      if (hasPrices) {
        await page.getByLabel('Valor (BRL)').fill('49.90')
        await expect(preview.getByText(/49,90/).last()).toBeVisible()
      } else {
        await expect(page.getByLabel('Valor (BRL)')).toHaveCount(0)
        await expect(preview.getByText('PREÇO UN.', { exact: true })).toHaveCount(0)
        await expect(preview.getByText('PAGAMENTO', { exact: true })).toHaveCount(0)
      }
      await checkEditorAccessibility(page)
    }
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Baixar PDF' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`${type}-QA-100.pdf`)
    const bytes = await readFile(await download.path())
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    expect(bytes.toString('latin1')).toMatch(/\/Count 1\b/)
    await expect(page.getByText('Download iniciado.')).toBeVisible()
  })
}

test('every added model renders in its assigned print layout', async ({ page }) => {
  await page.goto('/#editor')
  await page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name: 'Documento' }).click()
  const preview = page.getByRole('region', { name: 'Pré-visualização', exact: true })
  const type = page.getByLabel('Tipo de documento')
  const layoutMarkers = { recibo: 'Gerado com Mox Recibos', fatura: 'Documento gerado oficialmente por Mox Recibos', comercial: 'Partes Envolvidas' }
  for (const model of templates.filter(model => model.layout)) {
    await type.selectOption(model.id)
    await expect(preview.getByText(model.name.toLocaleUpperCase('pt-BR'), { exact: true })).toBeVisible()
    await expect(preview.getByText(layoutMarkers[model.layout], { exact: true })).toBeVisible()
  }
})

test('offers contracts in every category and exports clauses and validity', async ({ page }) => {
  const contracts = templates.filter(model => model.details?.contract)
  expect(contracts).toHaveLength(25)
  expect(new Set(contracts.map(model => model.category))).toEqual(new Set(categories.map(category => category.id)))
  expect(contracts.every(model => model.layout === 'comercial')).toBe(true)

  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  const contractsMenu = page.getByRole('link', { name: 'Contratos', exact: true })
  await contractsMenu.focus()
  await page.keyboard.press('Enter')
  await expect(contractsMenu).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveURL(/#contratos$/)
  await expect(page.getByRole('heading', { name: 'Modelos de contrato' })).toBeFocused()
  await expect(page.locator('.model-card')).toHaveCount(26)
  await checkEditorAccessibility(page)
  const category = page.getByRole('combobox', { name: 'Categoria' })
  await expect(category).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await category.selectOption('imoveis')
  await expect(page.locator('.model-card')).toHaveCount(2)
  await page.getByRole('searchbox', { name: 'Buscar modelos' }).fill('residencial')
  await expect(page.locator('.model-card')).toHaveCount(1)
  await page.getByRole('button', { name: /^Contrato de locação residencial/ }).click()
  await page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name: 'Documento' }).click()
  await page.getByLabel('Data do contrato').fill('2026-11-12')
  await page.getByLabel('Fim da vigência').fill('2027-11-12')
  await page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name: 'Cláusulas' }).click()
  await expect(page.getByRole('heading', { name: 'Escopo e cláusulas' })).toBeFocused()
  const help = label => page.getByLabel(`Ajuda: ${label}`, { exact: true })
  const addClauseHelp = help('Adicionar cláusula')
  const clauseExplanation = page.getByText('Cria uma cláusula numerada', { exact: false })
  await addClauseHelp.focus()
  await page.keyboard.press('Enter')
  await expect(clauseExplanation).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await help('Quantidade e unidade').click()
  await expect(clauseExplanation).toBeHidden()
  await expect(page.getByText('Mostra os campos para definir', { exact: false })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText('Mostra os campos para definir', { exact: false })).toBeHidden()
  await expect(help('Quantidade e unidade')).toBeFocused()
  await help('Adicionar entrega').click()
  await expect(page.getByText('Cria um campo para descrever', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Adicionar entrega', exact: true }).click()
  await expect(help('Remover entrega 2')).toBeVisible()
  await page.getByRole('button', { name: 'Remover entrega 2', exact: true }).click()
  await expect(help('Voltar')).toBeVisible()
  await expect(help('Ver prévia')).toBeVisible()
  await page.getByLabel('Escopo ou entrega').fill('Entrega das chaves')
  await page.getByRole('button', { name: 'Adicionar cláusula' }).click()
  const clause = page.getByRole('group', { name: 'Cláusula 1' })
  await expect(help('Remover cláusula 1')).toBeVisible()
  await expect(clause.getByLabel('Título')).toBeFocused()
  await clause.getByLabel('Título').fill('Entrega')
  await clause.getByLabel('Texto da cláusula').fill('Texto acordado entre as partes.')
  await checkEditorAccessibility(page)
  await page.getByRole('button', { name: 'Ver prévia', exact: true }).click()
  const preview = page.getByRole('region', { name: 'Pré-visualização', exact: true })
  await expect(preview.getByText('Cláusula 1 · Entrega')).toBeVisible()
  await expect(preview.getByText('Entrega das chaves')).toBeVisible()
  await expect(preview.getByText('Texto acordado entre as partes.')).toBeVisible()
  await expect(preview.getByText(/Fim da vigência:.*12\/11\/2027/)).toBeVisible()
  await expect(preview.getByText('TOTAL DO CONTRATO')).toHaveCount(0)
  await checkEditorAccessibility(page)
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PDF' }).click()
  const download = await pending
  expect(download.suggestedFilename()).toMatch(/^contrato-locacao-residencial-.*\.pdf$/)
  expect((await readFile(await download.path())).subarray(0, 5).toString()).toBe('%PDF-')
  await page.getByRole('link', { name: 'Contratos', exact: true }).click()
  await expect(page).toHaveURL(/#contratos$/)
  await expect(page.locator('.model-card')).toHaveCount(26)
})

test('keeps existing conditions and renumbers clauses in the generic contract', async ({ page }) => {
  await page.goto('/#editor')
  const section = name => page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name, exact: true })
  await section('Documento').click()
  await page.getByLabel('Observações').fill('Condições já preenchidas.')
  await page.getByLabel('Tipo de documento').selectOption('contrato')
  await section('Cláusulas').click()
  await expect(page.getByLabel('Condições gerais')).toHaveValue('Condições já preenchidas.')
  await page.getByLabel('Escopo ou entrega').fill('Serviço acordado')
  await page.getByText('Quantidade e unidade', { exact: true }).click()
  await page.getByLabel('Quantidade', { exact: true }).fill('2')
  await page.getByLabel('Valor unitário (BRL) · opcional').fill('125')
  const addClause = page.getByRole('button', { name: 'Adicionar cláusula' })
  await addClause.click()
  await page.getByRole('group', { name: 'Cláusula 1' }).getByLabel('Título').fill('Primeira')
  await addClause.click()
  await page.getByRole('group', { name: 'Cláusula 2' }).getByLabel('Título').fill('Segunda')
  await page.getByRole('button', { name: 'Remover cláusula 1' }).click()
  await expect(addClause).toBeFocused()
  await expect(page.getByRole('group', { name: 'Cláusula 1' }).getByLabel('Título')).toHaveValue('Segunda')
  await expect(page.getByText('Rascunho salvo neste navegador')).toBeVisible()
  await page.reload()
  await section('Cláusulas').click()
  await expect(page.getByRole('group', { name: 'Cláusula 1' }).getByLabel('Título')).toHaveValue('Segunda')
  const preview = page.getByRole('region', { name: 'Pré-visualização', exact: true })
  await expect(preview.getByText('Cláusula 1 · Segunda')).toBeVisible()
  await expect(preview.getByText('Condições já preenchidas.')).toBeVisible()
  await expect(preview.getByText(/R\$\s*250,00/).last()).toBeVisible()
  await section('Documento').click()
  await page.getByLabel('Tipo de documento').selectOption('proposta')
  await expect(preview.getByText('Cláusula 1 · Segunda')).toHaveCount(0)
})

test('reviews and inserts only the selected suggestions without sending draft data', async ({ page }) => {
  const clauses = [
    { title: 'Entregas', text: 'Descreva as etapas combinadas.' },
    { title: 'Revisões', text: 'Descreva a conferência combinada.' },
  ]
  await page.route('**/api/clauses', async route => {
    expect(route.request().postDataJSON()).toEqual({ type: 'contrato-locacao-residencial' })
    await route.fulfill({ json: { clauses } })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#contratos')
  await page.getByRole('button', { name: /^Contrato de locação residencial/ }).click()
  await page.getByLabel('Nome ou razão social').fill('Nome privado do locador')
  await page.getByRole('navigation', { name: 'Seções do editor' }).getByRole('button', { name: 'Cláusulas' }).click()
  await page.getByLabel('Escopo ou entrega').fill('Dados do imóvel que devem ficar no navegador.')
  const suggest = page.getByRole('button', { name: 'Criar com IA', exact: true })
  await expect(suggest).toBeVisible()
  const manual = page.getByRole('button', { name: 'Adicionar cláusula', exact: true })
  expect((await suggest.boundingBox()).y).toBeLessThan((await manual.boundingBox()).y)
  await suggest.click()
  const review = page.getByRole('region', { name: 'Revise as sugestões' })
  await expect(review.getByRole('heading')).toBeFocused()
  await expect(page.getByRole('group', { name: 'Cláusula 1' })).toHaveCount(0)
  await review.getByRole('checkbox', { name: /Revisões/ }).uncheck()
  await checkEditorAccessibility(page)
  await review.getByRole('button', { name: 'Inserir selecionadas' }).click()
  await expect(suggest).toBeFocused()
  await expect(page.getByRole('group', { name: 'Cláusula 1' }).getByLabel('Título')).toHaveValue('Entregas')
  await expect(page.getByRole('group', { name: 'Cláusula 2' })).toHaveCount(0)
  await page.getByRole('group', { name: 'Visualização do editor' }).getByRole('button', { name: 'Prévia' }).click()
  await expect(page.getByRole('region', { name: 'Pré-visualização', exact: true }).getByText('Cláusula 1 · Entregas')).toBeVisible()
})

test('server uses the free model for contracts and keeps suggestions usable during quota limits', async () => {
  const post = (type, origin = 'https://mox.example') => new Request('https://mox.example/api/clauses', {
    method: 'POST',
    headers: { origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  })
  let calls = 0
  const suggest = createSuggestionHandler(async input => {
    calls++
    expect(input.model).toEqual({ providerID: 'opencode', id: 'minimax-m3.1-flash-free' })
    expect(input.prompt).toContain('Contrato de locação residencial')
    return { text: '[{"title":"Escopo","text":"Preencha o escopo combinado."}]' }
  })
  expect((await suggest(post('recibo'))).status).toBe(400)
  expect((await suggest(post('contrato', 'https://elsewhere.example'))).status).toBe(403)
  const [first, second] = await Promise.all([suggest(post('contrato-locacao-residencial')), suggest(post('contrato-locacao-residencial'))])
  expect(await first.json()).toEqual(await second.json())
  expect(calls).toBe(1)
  const quota = createSuggestionHandler(async () => { throw generationError({ retryAfterMs: 60000 }) })
  const fallback = await quota(post('contrato'))
  expect(fallback.status).toBe(200)
  expect((await fallback.json()).clauses).toHaveLength(3)
})
