export default function LibraryFooter() {
  return (
    <footer className="library-footer">
      <div className="layout-width library-footer-inner">
        <div className="brand">
          <img className="brand-mark" src="/mox-recibos.png" alt="" width="35" height="33" />
          <span>Mox Recibos</span>
        </div>
        <nav aria-label="Rodapé">
          <a href="#modelos">Modelos de documentos</a>
          <a href="#contratos">Modelos de contrato</a>
          <a href="#editor">Abrir editor</a>
        </nav>
      </div>
    </footer>
  )
}
