import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const wcag = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function checkEditorAccessibility(page) {
  // The printed document has legacy colors and typography that must be preserved.
  const result = await new AxeBuilder({ page }).exclude('.paper').withTags(wcag).analyze()
  expect(result.violations).toEqual([])
}

test('filters the seven models and opens the selected document', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.model-card')).toHaveCount(7)
  await checkEditorAccessibility(page)
  await page.getByRole('button', { name: 'Serviços', exact: true }).click()
  await expect(page.locator('.model-card')).toHaveCount(2)
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
    if (width === 320) {
      await page.getByRole('button', { name: 'Ver prévia' }).click()
      await expect(page.getByRole('region', { name: 'Área de visualização do documento' })).toBeFocused()
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

for (const [name, type] of [['Recibo', 'recibo'], ['Fatura', 'fatura'], ['Proposta comercial', 'proposta']]) {
  test(`downloads the existing PDF layout for ${name}`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: new RegExp(`^${name}`) }).click()
    await page.getByRole('button', { name: 'Documento', exact: true }).click()
    await page.getByLabel('Número do documento').fill('QA-100')
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
