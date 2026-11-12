import { ArrowRight, PencilLine } from 'lucide-react'
import { useState } from 'react'
import { categories, templates } from './templates.js'

export default function TemplateLibrary({ onSelect, onResume, saved, current }) {
  const [filter, setFilter] = useState('todos')
  const visibleCategories = categories.filter(({ id }) => filter === 'todos' || filter === id)

  return (
    <main className="library layout-width" id="main-content">
      <div className="library-intro">
        <div>
          <h1 tabIndex={-1}>Modelos de documentos</h1>
          <p>Escolha um modelo, preencha os dados e baixe seu documento em PDF.</p>
        </div>
        {saved && <button className="button" onClick={onResume}><PencilLine size={16} aria-hidden="true" /> Continuar rascunho</button>}
      </div>

      <div className="filters" role="group" aria-label="Filtrar modelos">
        {[{ id: 'todos', label: 'Todos' }, ...categories].map(({ id, label }) => (
          <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {visibleCategories.map(({ id, label }) => (
        <section key={id} className="model-group" aria-labelledby={id}>
          <h2 id={id}>{label}</h2>
          <div className="model-grid">
            {templates.filter(template => template.category === id).map(({ id: type, name, description, icon: Icon }) => (
              <button className="model-card" key={type} onClick={() => onSelect(type)}>
                <span className="model-icon"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="model-arrow"><ArrowRight size={17} aria-hidden="true" /></span>
                <span className="model-name">{name}</span>
                <span className="model-description">
                  {description}{saved && type === current && <span className="model-draft">Rascunho em edição</span>}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
