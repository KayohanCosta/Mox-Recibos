import { ArrowRight, FileSignature, LayoutGrid, PencilLine, Search } from 'lucide-react'
import { useState } from 'react'
import { categories, isContract, templates } from './templates.js'

const normalize = value => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '')
export default function TemplateLibrary({ showContracts, onSelect, onResume, saved, current }) {
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const visibleTemplates = templates.filter(template => isContract(template) === showContracts)
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean)
  const visibleCategories = categories
    .filter(({ id }) => filter === 'todos' || filter === id)
    .map(category => ({
      ...category,
      models: visibleTemplates.filter(template =>
        template.category === category.id && terms.every(term =>
          normalize(`${template.name} ${template.description} ${category.label}`).includes(term))),
    }))
    .filter(({ models }) => models.length > 0)
  const matches = visibleCategories.reduce((count, { models }) => count + models.length, 0)

  return (
    <main className="library layout-width" id="main-content">
      <div className="library-intro">
        <div>
          <h1 tabIndex={-1}>{showContracts ? 'Modelos de contrato' : 'Modelos de documentos'}</h1>
          <p>{showContracts
            ? 'Escolha um contrato, preencha os dados e baixe o PDF.'
            : 'Escolha um modelo, preencha os dados e baixe seu documento em PDF.'}</p>
        </div>
        {saved && <button className="button" onClick={onResume}><PencilLine size={16} aria-hidden="true" /> Continuar rascunho</button>}
      </div>

      <nav className="library-menu" aria-label="Tipos de modelo">
        <a href="#modelos" aria-current={!showContracts ? 'page' : undefined}>
          <LayoutGrid size={17} aria-hidden="true" /> Documentos
        </a>
        <a href="#contratos" className="contracts-menu-item" aria-current={showContracts ? 'page' : undefined}>
          <FileSignature size={17} aria-hidden="true" /> Contratos
        </a>
      </nav>
      <div className="model-filters">
        <div className="model-search">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="template-search">Buscar modelos</label>
          <input id="template-search" type="search" placeholder="Buscar modelos" value={search}
            onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="model-category">
          <label htmlFor="template-category">Categoria</label>
          <select id="template-category" value={filter} onChange={event => setFilter(event.target.value)}>
            <option value="todos">Todas as categorias</option>
            {categories.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
      </div>

      {(filter !== 'todos' || terms.length > 0) && matches > 0 && (
        <p className="model-results" aria-live="polite">{matches} {matches === 1 ? 'modelo encontrado' : 'modelos encontrados'}</p>
      )}
      {matches === 0 && (
        <div className="empty-models">
          <p role="status">Nenhum modelo encontrado.</p>
          <button type="button" className="button" onClick={() => {
            setSearch('')
            setFilter('todos')
            document.getElementById('template-search')?.focus()
          }}>Limpar filtros</button>
        </div>
      )}
      {visibleCategories.map(({ id, label, models }) => (
        <section key={id} className="model-group" aria-labelledby={id}>
          <h2 id={id}>{label}</h2>
          <div className="model-grid">
            {models.map(({ id: type, name, description, icon: Icon }) => (
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
