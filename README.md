# Mox Recibos

Editor de documentos para profissionais autônomos, prestadores de serviços e pequenas empresas. Escolha um modelo, preencha os dados, confira a prévia A4 e baixe o PDF diretamente no navegador.

[**Acessar o Mox Recibos**](https://easy-recibos.vercel.app/)

## O que você pode criar

A biblioteca reúne **102 modelos em 15 categorias**, com busca e filtro por área. Os **26 modelos de contrato** têm uma seção própria.

| Família de impressão | Exemplos |
| --- | --- |
| Recibo | Recibo de pagamento, aluguel, reembolso, doação e mensalidade. Também atende comprovantes e relatórios que usam o mesmo formato. |
| Fatura | Fatura, ordem de serviço, pedido de compra e demonstrativo de cobrança. |
| Comercial | Orçamento, proposta e contratos de prestação de serviços, locação, tecnologia, eventos e outras áreas. |

## Fluxo de edição

1. Escolha um modelo em **Documentos** ou **Contratos**.
2. Preencha os dados das partes, as informações do documento e os itens. Nos contratos, use **Cláusulas** para organizar o escopo, as entregas e as condições.
3. Confira a prévia A4. Em telas estreitas, alterne entre **Editar** e **Prévia**. O controle de zoom e o modo expandido ajudam a revisar o documento.
4. Clique em **Baixar PDF**. O recibo usa o logo da Mox por padrão e exibe o logo do emissor após o upload.

Os três layouts de impressão usam preto, branco e cinza, incluindo os logos na prévia e no PDF. O navegador mantém um rascunho atual, incluindo o logo enviado, por meio do IndexedDB. O rascunho pode ser retomado no mesmo navegador pela biblioteca. A geração de PDF acontece no dispositivo.

## Rascunhos de contrato

Em **Cláusulas e condições**, selecione **Criar com IA** e informe, se quiser, um resumo do acordo. O serviço prepara um rascunho com escopo e cláusulas a partir do modelo escolhido. Você pode selecionar trechos, inseri-los no documento e revisar o texto antes de assinar.

A solicitação envia somente o identificador do modelo e o resumo digitado nessa ação. Os dados das partes, o logo e os outros campos do editor ficam no navegador. Se o serviço de geração estiver indisponível ou a cota estiver esgotada, o editor preserva o resumo e permite continuar a edição manual.

## Desenvolvimento local

Use **Node.js 24** e npm. A partir da raiz do repositório, execute:

```bash
npm ci
npm run dev
```

O Vite informa o endereço no terminal. Por padrão, é [http://localhost:5173](http://localhost:5173/).

Para testar a geração de rascunhos localmente, defina `OPENCODE_API_KEY` em `.env.local`. O servidor de desenvolvimento inicia uma instância local do OpenCode e usa a rota oficial de geração sem sessão com o modelo `opencode/minimax-m3.1-flash-free`.

## Estrutura técnica

| Caminho | Responsabilidade |
| --- | --- |
| `src/templates.js`, `src/expandedTemplates.js` e `src/contractModels.js` | Catálogo, categorias e configuração dos modelos. |
| `App.jsx`, `FormSection.jsx` e `src/PreviewPane.jsx` | Navegação, formulário contextual e pré-visualização. |
| `src/useDraft.js` | Recuperação e salvamento do rascunho no IndexedDB. |
| `ReceiptPreview.jsx` e `src/downloadPDF.js` | Layouts de impressão, captura, paginação e links no PDF. |
| `api/clauses.js` e `server/` | Validação das solicitações e integração com o OpenCode. |
| `tests/editor.spec.js` | Testes do catálogo, edição, acessibilidade e exportação. |

A interface usa React 19, Vite, Tailwind CSS e CSS. A exportação usa html2canvas e jsPDF. Os testes de navegador usam Playwright e axe.

## Build, testes e hospedagem

```bash
npm run build
npx playwright install chromium
npm test
```

O build gera o frontend em `dist/`. A suíte cobre busca e filtros, navegação por teclado, persistência, prévia dos modelos, geração de rascunhos com respostas simuladas e exportações representativas. A auditoria automatizada com axe abrange a interface do editor e os controles da prévia.

Na Vercel, o projeto usa o preset Vite e a função `/api/clauses`. Para habilitar rascunhos em produção, configure um servidor OpenCode v2 acessível por HTTPS e defina `OPENCODE_SERVER_URL` e `OPENCODE_PASSWORD` como variáveis privadas na hospedagem. A credencial do provedor fica no servidor OpenCode.

## Créditos e direitos

Desenvolvido por **Kayohan Costa**.

[Portfólio](https://mox-desenvolvimento.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/kayohancostadev) · [GitHub](https://github.com/KayohanCosta)

© 2026 Kayohan Costa. Todos os direitos reservados.
