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
        </nav>
        <div className="footer-credits">
          <p>Desenvolvido por <strong>Kayohan Costa</strong></p>
          <nav aria-label="Links de Kayohan Costa">
            <a href="https://mox-desenvolvimento.vercel.app/" target="_blank" rel="noopener noreferrer">Portfólio</a>
            <a href="https://www.linkedin.com/in/kayohancostadev" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/KayohanCosta" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
        </div>
      </div>
      <div className="layout-width footer-copyright">
        <small>© {new Date().getFullYear()} Kayohan Costa. Todos os direitos reservados.</small>
      </div>
    </footer>
  )
}
