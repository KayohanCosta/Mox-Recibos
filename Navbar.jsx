import { ArrowRight, LayoutGrid } from 'lucide-react'

export default function Navbar({ editor, onNavigate }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#modelos" onClick={(event) => { event.preventDefault(); onNavigate('modelos') }}>
          <img className="brand-mark" src="/mox-recibos.png" alt="" width="35" height="33" />
          Mox Recibos
        </a>
        <nav aria-label="Navegação principal">
          <a href="#modelos" aria-current={!editor ? 'page' : undefined}
            onClick={(event) => { event.preventDefault(); onNavigate('modelos') }}>
            <LayoutGrid size={16} aria-hidden="true" /> Modelos
          </a>
          <a href="#editor" aria-current={editor ? 'page' : undefined}
            onClick={(event) => { event.preventDefault(); onNavigate('editor') }}>
            Editor <ArrowRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
