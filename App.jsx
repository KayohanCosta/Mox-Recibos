import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, Download, Eye, FileText, List, LoaderCircle, PencilLine, UserRound } from 'lucide-react'
import FormSection from './FormSection.jsx'
import ActionHelp from './src/ActionHelp.jsx'
import Navbar from './Navbar.jsx'
import ReceiptPreview from './ReceiptPreview.jsx'
import PreviewPane from './src/PreviewPane.jsx'
import TemplateLibrary from './src/TemplateLibrary.jsx'
import LibraryFooter from './src/LibraryFooter.jsx'
import useDraft from './src/useDraft.js'
import { documentDetails, isContract, itemTotal, templates } from './src/templates.js'

const sections = [
  { id: 'empresa', name: 'Empresa', icon: Building2, title: 'Dados da empresa', description: 'Identifique quem emite o documento.' },
  { id: 'cliente', name: 'Cliente', icon: UserRound, title: 'Dados do cliente', description: 'Identifique quem recebe o documento.' },
  { id: 'documento', name: 'Documento', icon: FileText, title: 'Detalhes do documento', description: 'Defina datas, pagamento e observações.' },
  { id: 'itens', name: 'Itens', icon: List, title: 'Itens e valores', description: 'Liste os produtos ou serviços e confira o total.' },
]

function pageFromLocation() {
  const hash = window.location.hash.slice(1)
  return ['editor', 'contratos'].includes(hash) ? hash : 'modelos'
}

export default function App() {
  const [page, setPage] = useState(pageFromLocation)
  const [active, setActive] = useState(0)
  const [mobilePane, setMobilePane] = useState('edit')
  const [generation, setGeneration] = useState('idle')
  const [exportDocument, setExportDocument] = useState(null)
  const { draft, status, update, updateDraft } = useDraft()
  const saved = status === 'saved'
  const capture = useRef(null)
  const editor = page === 'editor'
  const focusOnNavigation = useRef(false)
  const sectionHeading = useRef(null)
  const focusOnSectionChange = useRef(false)
  const focusOnPaneChange = useRef(false)
  const section = sections[active]
  const template = templates.find(({ id }) => id === draft.receipt.type) ?? templates[0]
  const contract = isContract(template)
  const libraryPage = contract ? 'contratos' : 'modelos'
  const details = documentDetails[template.id]
  const sectionTitle = contract && section.id === 'itens' ? 'Escopo e cláusulas' : details
    ? { empresa: details.party[0], cliente: details.party[1], itens: details.items }[section.id] ?? section.title
    : section.title
  const subtotal = draft.items.reduce((sum, item) => sum + itemTotal(item), 0)
  const documentProps = { ...draft, subtotal }
  const sectionName = entry => contract && entry.id === 'itens' ? 'Cláusulas' : entry.name
  const clausesSection = contract && section.id === 'itens'
  const backButton = <button className="button" onClick={() => selectSection(active - 1)}><ArrowLeft size={16} aria-hidden="true" /> Voltar</button>
  const previewButton = <button className={clausesSection ? 'button' : 'button next-section'} onClick={() => selectPane('preview')}>
    Ver prévia <ArrowRight size={16} aria-hidden="true" />
  </button>

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

  useEffect(() => {
    if (!focusOnPaneChange.current) return
    focusOnPaneChange.current = false
    focusPane(mobilePane)
  }, [mobilePane])

  function navigate(next) {
    if (next !== page) window.location.hash = next
  }

  function selectTemplate(type) {
    if (type !== draft.receipt.type || !saved) update('receipt', current => ({ ...current, type }))
    setActive(0)
    setMobilePane('edit')
    navigate('editor')
  }

  function selectSection(index) {
    if (index === active) return
    focusOnSectionChange.current = true
    setActive(index)
  }

  function focusPane(pane) {
    if (pane === 'edit') sectionHeading.current?.focus()
    else document.getElementById('preview-area')?.focus()
  }

  function selectPane(pane) {
    if (pane === mobilePane) {
      focusPane(pane)
      return
    }
    focusOnPaneChange.current = true
    setMobilePane(pane)
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
          <div className="editor-commandbar">
            <div className="editor-view-switch" role="group" aria-label="Visualização do editor">
              <button type="button" aria-pressed={mobilePane === 'edit'} onClick={() => selectPane('edit')}>
                <PencilLine size={16} aria-hidden="true" /> Editar
              </button>
              <button type="button" aria-pressed={mobilePane === 'preview'} onClick={() => selectPane('preview')}>
                <Eye size={17} aria-hidden="true" /> Prévia
              </button>
            </div>
            <div className="export-action">
              <button className="button primary" onClick={handleDownload} disabled={generation === 'loading'}>
                {generation === 'loading' ? <LoaderCircle className="spinner" size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
                {generation === 'loading' ? 'Gerando PDF…' : 'Baixar PDF'}
              </button>
              {generation === 'done' && <small role="status">Download iniciado.</small>}
              {generation === 'error' && <small className="field-error" role="alert">Falha ao gerar o PDF. Tente novamente.</small>}
            </div>
          </div>

          <div className="workspace" data-mobile-pane={mobilePane}>
            <div className="editor-side">
              <nav className="section-nav" aria-label="Seções do editor">
                {sections.map(({ id, name, icon: Icon }, index) => (
                  <button key={id} aria-current={index === active ? 'step' : undefined} onClick={() => selectSection(index)}>
                    <Icon size={16} aria-hidden="true" /> {sectionName({ id, name })}
                  </button>
                ))}
              </nav>
              <section className="editor-panel" aria-labelledby="section-heading">
                <div className="section-content">
                  <h2 id="section-heading" tabIndex={-1} ref={sectionHeading}>{sectionTitle}</h2>
                  {sectionTitle === section.title && <p>{section.description}</p>}
                  <FormSection activeTab={section.id} draft={draft} update={update} updateDraft={updateDraft}
                    subtotal={subtotal} contract={contract} />
                </div>
                <div className="section-footer">
                  {active > 0 && (clausesSection ? <ActionHelp className="action-help-start" label="Voltar"
                    help="Volta para os dados do documento, onde você pode ajustar datas, moeda e condição de pagamento.">{backButton}</ActionHelp> : backButton)}
                  {active < sections.length - 1 && <button className="button next-section" onClick={() => selectSection(active + 1)}>
                    {sectionName(sections[active + 1])} <ChevronRight size={16} aria-hidden="true" />
                  </button>}
                  {active === sections.length - 1 && (clausesSection ? <ActionHelp className="next-section" label="Ver prévia"
                    help="Leva à pré-visualização para conferir o contrato antes de baixar o PDF.">{previewButton}</ActionHelp> : previewButton)}
                </div>
              </section>
            </div>
            <div className="preview-column">
              <PreviewPane document={documentProps} />
            </div>
          </div>
        </main>
      ) : (
        <>
          <TemplateLibrary key={page} showContracts={page === 'contratos'} onSelect={selectTemplate}
            onResume={() => navigate('editor')} saved={saved} current={draft.receipt.type} />
          <LibraryFooter />
        </>
      )}
    </>
  )
}
