import { useEffect, useId, useRef, useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import ActionHelp from './ActionHelp.jsx'

export default function ClauseSuggestions({ type, onInsert }) {
  const [phase, setPhase] = useState('idle')
  const [brief, setBrief] = useState('')
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState([])
  const request = useRef(null)
  const trigger = useRef(null)
  const restoreFocus = useRef(false)
  const heading = useRef(null)
  const briefField = useRef(null)
  const headingId = useId()
  const briefId = useId()
  const composing = phase === 'compose' || phase === 'loading'

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (phase === 'review') heading.current?.focus()
    if (phase === 'compose') briefField.current?.focus()
    if (restoreFocus.current) {
      restoreFocus.current = false
      trigger.current?.focus()
    }
  }, [phase])

  async function generate(event) {
    event.preventDefault()
    const controller = new AbortController()
    request.current = controller
    setError('')
    setPhase('loading')
    try {
      const response = await fetch('/api/clauses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, brief: brief.trim() }),
        signal: controller.signal,
      })
      const draft = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok) {
        setError(draft.code === 'quota'
          ? 'A cota de geração foi atingida. Você pode continuar editando e tentar novamente mais tarde.'
          : 'Não foi possível gerar o rascunho. Tente novamente.')
        setPhase('compose')
        return
      }
      const options = [
        ...draft.scope.map((text, index) => ({ kind: 'scope', title: `Escopo ${index + 1}`, text })),
        ...draft.clauses.map(clause => ({ kind: 'clause', ...clause })),
      ]
      setSuggestions(options)
      setSelected(options.map((_, index) => index))
      setPhase('review')
    } catch {
      if (controller.signal.aborted) return
      setError('Não foi possível gerar o rascunho. Tente novamente.')
      setPhase('compose')
    }
  }

  function close(next) {
    request.current?.abort()
    setError('')
    restoreFocus.current = true
    setPhase(next)
  }

  return (
    <>
      <ActionHelp label="Criar com IA" help="Cria um rascunho de escopo e cláusulas. Você decide quais partes inserir no contrato.">
        <button ref={trigger} type="button" className="button suggest-button" onClick={() => setPhase('compose')}
          disabled={composing || phase === 'review'}>
          <Sparkles size={16} aria-hidden="true" /> Criar com IA
        </button>
      </ActionHelp>
      {phase === 'inserted' && <p className="suggestion-feedback" role="status">Rascunho inserido. Você pode editar o escopo e as cláusulas.</p>}
      {composing && (
        <form className="suggestion-review" onSubmit={generate}>
          <div className="field">
            <label htmlFor={briefId}>Resumo do acordo <span className="brief-optional">opcional</span></label>
            <textarea id={briefId} ref={briefField} rows={5} maxLength={2000} value={brief}
              onChange={event => setBrief(event.target.value)} readOnly={phase === 'loading'}
              aria-describedby={`${briefId}-help`}
              placeholder="Ex.: o que será entregue, prazos, valores e responsabilidades combinadas." />
          </div>
          <p id={`${briefId}-help`}>Só este resumo e o tipo de contrato são enviados para a geração. Deixe CPF, CNPJ e outros dados das partes nos campos do editor.</p>
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="suggestion-actions">
            <button className="button" type="button" onClick={() => close('idle')}>Cancelar</button>
            <button className="button primary" type="submit" disabled={phase === 'loading'}>
              {phase === 'loading' && <LoaderCircle size={16} className="spinner" aria-hidden="true" />}
              {phase === 'loading' ? 'Gerando rascunho…' : 'Gerar rascunho'}
            </button>
          </div>
          <span className="sr-only" role="status">{phase === 'loading' ? 'Gerando rascunho do contrato.' : ''}</span>
        </form>
      )}
      {phase === 'review' && (
        <section className="suggestion-review" aria-labelledby={headingId}>
          <h4 id={headingId} ref={heading} tabIndex={-1}>Revise o rascunho</h4>
          <p>Escolha o que inserir e confira as condições e os campos a definir antes de assinar.</p>
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
            <button className="button" type="button" onClick={() => setPhase('compose')}>Editar resumo</button>
            <button className="button" type="button" onClick={() => close('idle')}>Cancelar</button>
            <button className="button primary" type="button" disabled={!selected.length} onClick={() => {
              const accepted = suggestions.filter((_, index) => selected.includes(index))
              onInsert({
                scope: accepted.filter(entry => entry.kind === 'scope').map(entry => entry.text),
                clauses: accepted.filter(entry => entry.kind === 'clause').map(({ title, text }) => ({ title, text })),
              })
              close('inserted')
            }}>Inserir selecionadas</button>
          </div>
        </section>
      )}
    </>
  )
}
