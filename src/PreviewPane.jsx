import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Plus, X } from 'lucide-react'
import ReceiptPreview from '../ReceiptPreview.jsx'

const pageWidth = 794
const step = 0.15

function PreviewSurface({ document, expanded = false, onExpand, onClose }) {
  const viewport = useRef(null)
  const paper = useRef(null)
  const [fit, setFit] = useState(0.5)
  const [height, setHeight] = useState(1123)
  const [zoom, setZoom] = useState(null)
  const scale = zoom ?? fit

  useEffect(() => {
    const frame = viewport.current
    const sheet = paper.current
    const measure = () => {
      const available = frame.clientWidth - 32
      if (available > 0) setFit(Math.min(1, available / pageWidth))
      setHeight(sheet.offsetHeight)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(sheet)
    measure()
    return () => observer.disconnect()
  }, [])

  return (
    <section className="preview-panel" aria-label={expanded ? 'Documento expandido' : 'Pré-visualização'}>
      <div className="preview-toolbar">
        {expanded
          ? <h2 id="expanded-title">Pré-visualização</h2>
          : <h2>Pré-visualização <span className="paper-size">A4</span></h2>}
        <div className="zoom-controls" role="group" aria-label="Zoom da pré-visualização">
          <button className="icon-button" aria-label="Diminuir zoom" disabled={scale <= 0.2}
            onClick={() => setZoom(Math.max(0.2, scale - step))}><Minus size={16} aria-hidden="true" /></button>
          <button className="zoom-value" title="Ajustar à largura" aria-label={`Ajustar à largura, zoom atual ${Math.round(scale * 100)}%`}
            onClick={() => setZoom(null)}>{Math.round(scale * 100)}%</button>
          <button className="icon-button" aria-label="Aumentar zoom" disabled={scale >= 2}
            onClick={() => setZoom(Math.min(2, scale + step))}><Plus size={16} aria-hidden="true" /></button>
        </div>
        {expanded
          ? <button className="icon-button" aria-label="Fechar visualização expandida" onClick={onClose}><X size={19} aria-hidden="true" /></button>
          : <button className="icon-button" aria-label="Expandir pré-visualização" onClick={onExpand}><Maximize2 size={17} aria-hidden="true" /></button>}
      </div>
      <div className="preview-viewport" id={expanded ? undefined : "preview-area"} ref={viewport} tabIndex={0} role="region" aria-label="Área de visualização do documento">
        <div className="paper-frame" style={{ width: pageWidth * scale, height: height * scale }}>
          <div className="paper" style={{ transform: `scale(${scale})` }}>
            <ReceiptPreview {...document} ref={paper} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PreviewPane({ document }) {
  const dialog = useRef(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (expanded) dialog.current.showModal()
  }, [expanded])

  return (
    <>
      <PreviewSurface document={document} onExpand={() => setExpanded(true)} />
      <dialog className="preview-dialog" ref={dialog} aria-labelledby="expanded-title" onClose={() => setExpanded(false)}>
        {expanded && <PreviewSurface document={document} expanded onClose={() => dialog.current.close()} />}
      </dialog>
    </>
  )
}
