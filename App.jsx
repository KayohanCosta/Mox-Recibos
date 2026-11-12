import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Download, FileText, List, LoaderCircle, UserRound } from 'lucide-react'
import FormSection from './FormSection.jsx'
import Navbar from './Navbar.jsx'
import ReceiptPreview from './ReceiptPreview.jsx'
import PreviewPane from './src/PreviewPane.jsx'
import TemplateLibrary from './src/TemplateLibrary.jsx'
import useDraft from './src/useDraft.js'
import { documentDetails, isContract, itemTotal, templates } from './src/templates.js'

const sections = [
  { id: 'empresa', name: 'Empresa', icon: Building2, title: 'Dados da empresa', description: 'Identifique quem emite o documento.' },
  { id: 'cliente', name: 'Cliente', icon: UserRound, title: 'Dados do cliente', description: 'Identifique quem recebe o documento.' },
  { id: 'documento', name: 'Documento', icon: FileText, title: 'Detalhes do documento', description: 'Defina datas, pagamento e observações.' },
  { id: 'itens', name: 'Itens', icon: List, title: 'Itens e valores', description: 'Liste os produtos ou serviços e confira o total.' },
]

const focusPreview = () => document.getElementById('preview-area')?.focus()
function pageFromLocation() {
  const hash = window.location.hash.slice(1)
  return ['editor', 'contratos'].includes(hash) ? hash : 'modelos'
}

export default function App() {
  const [page, setPage] = useState(pageFromLocation)
  const [active, setActive] = useState(0)
  const [generation, setGeneration] = useState('idle')
  const [exportDocument, setExportDocument] = useState(null)
  const { draft, status, update } = useDraft()
  const saved = status === 'saved'
  const capture = useRef(null)
  const editor = page === 'editor'
  const focusOnNavigation = useRef(false)
  const sectionHeading = useRef(null)
  const focusOnSectionChange = useRef(false)
  const section = sections[active]
  const template = templates.find(({ id }) => id === draft.receipt.type) ?? templates[0]
  const libraryPage = isContract(template) ? 'contratos' : 'modelos'
  const details = documentDetails[template.id]
  const sectionTitle = details
    ? { empresa: details.party[0], cliente: details.party[1], itens: details.items }[section.id] ?? section.title
    : section.title
  const subtotal = draft.items.reduce((sum, item) => sum + itemTotal(item), 0)
  const documentProps = { ...draft, subtotal }

  useEffect(() => {
    const onHashChange = () => {
      const next = pageFromLocation()
      if (next === page) return
      focusOnNavigation.current = true
      setPage(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [page])

  useEffect(() => {
    if (status === 'loading' || !focusOnNavigation.current) return
    focusOnNavigation.current = false
    document.querySelector('#main-content h1')?.focus()
    window.scrollTo(0, 0)
  }, [page, status])

  useEffect(() => {
    if (!focusOnSectionChange.current) return
    focusOnSectionChange.current = false
    sectionHeading.current?.focus()
  }, [active])

  function navigate(next) {
    if (next !== page) window.location.hash = next
  }

  function selectTemplate(type) {
    if (type !== draft.receipt.type || !saved) update('receipt', current => ({ ...current, type }))
    setActive(0)
    navigate('editor')
  }

  function selectSection(index) {
    if (index === active) return
    focusOnSectionChange.current = true
    setActive(index)
  }

  async function handleDownload() {
    const element = capture.current
    setExportDocument(documentProps)
    setGeneration('loading')
    try {
      const { default: downloadPDF } = await import('./src/downloadPDF.js')
      await document.fonts.ready
      await downloadPDF(element, draft.receipt)
      setGeneration('done')
    } catch {
      setGeneration('error')
    } finally {
      setExportDocument(null)
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault()
        document.querySelector('#main-content h1')?.focus()
      }}>Ir para o conteúdo</a>
      <Navbar editor={editor} onNavigate={navigate} />
      <div className="pdf-capture" aria-hidden="true">
        <ReceiptPreview {...(exportDocument ?? documentProps)} ref={capture} />
      </div>
      {status === 'loading' ? (
        <main className="layout-width library" id="main-content"><h1 tabIndex={-1} role="status">Carregando documentos…</h1></main>
      ) : editor ? (
        <main className="editor layout-width" id="main-content">
          <div className="editor-heading">
            <div>
              <a className="back-link" href={`#${libraryPage}`}>
                <ArrowLeft size={15} aria-hidden="true" /> {libraryPage === 'contratos' ? 'Contratos' : 'Modelos'}
              </a>
              <h1 tabIndex={-1}>{template.name}</h1>
              <p className="draft-status" role="status">
                {status === 'error' ? 'O rascunho está indisponível neste navegador.'
                  : status === 'saving' ? 'Salvando rascunho…'
                  : saved ? <><Check size={15} aria-hidden="true" /> Rascunho salvo neste navegador</>
                    : 'As alterações serão salvas neste navegador.'}
              </p>
            </div>
            <div className="export-action">
              <div className="editor-actions">
                <button className="button primary" onClick={handleDownload} disabled={generation === 'loading'}>
                  {generation === 'loading' ? <LoaderCircle className="spinner" size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
                  {generation === 'loading' ? 'Gerando PDF…' : 'Baixar PDF'}
                </button>
                <button className="button jump-preview" onClick={focusPreview}>Ver prévia</button>
              </div>
              {generation === 'done' && <small role="status">Download iniciado.</small>}
              {generation === 'error' && <small className="field-error" role="alert">Falha ao gerar o PDF. Tente novamente.</small>}
            </div>
          </div>

          <div className="workspace">
            <section className="editor-panel" aria-labelledby="section-heading">
              <nav className="section-nav" aria-label="Seções do editor">
                {sections.map(({ id, name, icon: Icon }, index) => (
                  <button key={id} aria-current={index === active ? 'step' : undefined} onClick={() => selectSection(index)}>
                    <Icon size={16} aria-hidden="true" /> {name}
                  </button>
                ))}
              </nav>
              <div className="section-content">
                <h2 id="section-heading" tabIndex={-1} ref={sectionHeading}>{sectionTitle}</h2>
                {sectionTitle === section.title && <p>{section.description}</p>}
                <FormSection activeTab={section.id} draft={draft} update={update} subtotal={subtotal} />
              </div>
              <div className="section-footer">
                {active > 0 && <button className="button" onClick={() => selectSection(active - 1)}><ArrowLeft size={16} aria-hidden="true" /> Voltar</button>}
                {active < sections.length - 1 && <button className="button next-section" onClick={() => selectSection(active + 1)}>
                  {sections[active + 1].name} <ChevronRight size={16} aria-hidden="true" />
                </button>}
                {active === sections.length - 1 && <button className="button next-section" onClick={focusPreview}>Ver prévia <ArrowRight size={16} aria-hidden="true" /></button>}
              </div>
            </section>
            <div className="preview-column">
              <PreviewPane document={documentProps} />
            </div>
          </div>
        </main>
      ) : <TemplateLibrary key={page} showContracts={page === 'contratos'} onSelect={selectTemplate}
        onResume={() => navigate('editor')} saved={saved} current={draft.receipt.type} />}
    </>
  )
}
