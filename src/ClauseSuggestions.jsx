import { useEffect, useId, useRef, useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import ActionHelp from './ActionHelp.jsx'

export default function ClauseSuggestions({ type, onInsert }) {
  const [phase, setPhase] = useState('idle')
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState([])
  const request = useRef(null)
  const trigger = useRef(null)
  const restoreFocus = useRef(false)
  const heading = useRef(null)
  const headingId = useId()

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (phase === 'review') heading.current?.focus()
    if (restoreFocus.current) {
      restoreFocus.current = false
      trigger.current?.focus()
    }
  }, [phase])

  async function suggest() {
    const controller = new AbortController()
    request.current = controller
    setPhase('loading')
    try {
      const response = await fetch('/api/clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('Suggestions unavailable')
      const { clauses } = await response.json()
      if (controller.signal.aborted) return
      setSuggestions(clauses)
      setSelected(clauses.map((_, index) => index))
      setPhase('review')
    } catch {
      if (!controller.signal.aborted) setPhase('error')
    }
  }

  function close(next) {
    restoreFocus.current = true
    setPhase(next)
  }

  return (
    <>
      <ActionHelp label="Criar com IA" help="Prepara sugestões para este modelo. Você escolhe quais inserir e pode editar o texto.">
        <button ref={trigger} type="button" className="button suggest-button" onClick={suggest}
          disabled={phase === 'loading' || phase === 'review'}>
          {phase === 'loading' ? <LoaderCircle size={16} className="spinner" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {phase === 'loading' ? 'Preparando sugestões…' : 'Criar com IA'}
        </button>
      </ActionHelp>
      <div className="sr-only" role="status">{phase === 'loading' ? 'Preparando sugestões de cláusulas.' : ''}</div>
      {phase === 'error' && <p className="field-error" role="alert">Não foi possível preparar as sugestões. Tente novamente em instantes.</p>}
      {phase === 'inserted' && <p className="suggestion-feedback" role="status">Sugestões adicionadas. Você pode editar as cláusulas abaixo.</p>}
      {phase === 'review' && (
        <section className="suggestion-review" aria-labelledby={headingId}>
          <h4 id={headingId} ref={heading} tabIndex={-1}>Revise as sugestões</h4>
          <p>Selecione o que faz sentido para o seu acordo e revise o texto antes de usar.</p>
          <div className="suggestion-list">
            {suggestions.map(({ title, text }, index) => (
              <label className="suggestion-option" key={index}>
                <input type="checkbox" checked={selected.includes(index)} onChange={event => {
                  setSelected(current => event.target.checked ? [...current, index] : current.filter(entry => entry !== index))
                }} />
                <span><strong>{title}</strong><span>{text}</span></span>
              </label>
            ))}
          </div>
          <div className="suggestion-actions">
            <button className="button" type="button" onClick={() => close('idle')}>Cancelar</button>
            <button className="button primary" type="button" disabled={!selected.length} onClick={() => {
              onInsert(suggestions.filter((_, index) => selected.includes(index)))
              close('inserted')
            }}>Inserir selecionadas</button>
          </div>
        </section>
      )}
    </>
  )
}
