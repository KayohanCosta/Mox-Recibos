# 📄 Mox Recibos

Uma plataforma moderna para criação, personalização e exportação de recibos, faturas, propostas comerciais, contratos e ordens de serviço.

Escolha um modelo na biblioteca, preencha os dados no editor e exporte o documento em PDF. O rascunho atual é salvo no navegador e pode ser retomado pela biblioteca.

## ✨ Principais Funcionalidades

* Geração de recibos profissionais
* Criação de faturas e ordens de serviço
* Emissão de propostas comerciais
* Modelos de contratos personalizados
* Biblioteca com 102 modelos em 15 categorias, submenu de contratos, busca e filtro por categoria
* Visualização em tempo real com zoom e modo expandido
* Salvamento automático do rascunho e do logo no navegador
* Exportação para PDF
* Interface moderna e responsiva
* Experiência otimizada para desktop e dispositivos móveis
* Sistema de layouts adaptativos conforme o tipo de documento

## 📄 Tipos de Documentos Suportados

### Recibos e Notas de Serviço

Layouts simples e objetivos para comprovação de pagamentos e prestação de serviços.

### Faturas e Ordens de Serviço

Estrutura corporativa com destaque para valores, condições e informações financeiras.

### Propostas Comerciais

Modelos focados em apresentação profissional de serviços e produtos.

### Contratos

Modelos no layout comercial com identificação das partes, escopo, valores, vigência, cláusulas editáveis e áreas de assinatura. A biblioteca oferece contratos em todas as categorias.

### Modelos por área

Além dos modelos originais, a biblioteca inclui recibos de reembolso, aluguel, mensalidades e doações, pedidos de compra, comprovantes de entrega, relatórios de serviços e outros documentos para finanças, vendas, logística, imóveis, educação, eventos, organizações e rotinas administrativas. Cada modelo usa um dos três layouts de impressão do Mox Recibos.

Hospedagem, transporte, esportes, tecnologia e produção criativa também têm modelos específicos, como confirmação de reserva, registro de coleta, mensalidade esportiva, aceite de software e orçamento de fotografia.

## 🚀 Tecnologias Utilizadas

### Frontend

* React
* Vite

### Estilização

* Tailwind CSS
* CSS Customizado

### Geração de PDF

* jsPDF
* html2canvas

### Ícones

* Lucide no editor e Iconify nos documentos

## ⚙️ Como Executar o Projeto

### Instalar Dependências

```bash id="bq2h7z"
npm install
```

### Executar Ambiente de Desenvolvimento

```bash id="qzv8jm"
npm run dev
```

Na seção **Cláusulas e condições**, use **Criar com IA** para descrever o acordo e gerar um rascunho de escopo e cláusulas. O servidor recebe apenas o identificador público do modelo e o resumo digitado nessa ação. Você escolhe quais trechos inserir e pode editá-los antes de exportar.

### Configuração do servidor

Para geração local, o responsável pelo projeto pode definir `OPENCODE_API_KEY` em `.env.local`. O servidor de desenvolvimento inicia uma instância local do OpenCode e usa sua rota oficial de geração sem sessão. Em produção, a função `/api/clauses` usa um servidor OpenCode v2 dedicado, acessível por HTTPS, com `OPENCODE_SERVER_URL` e `OPENCODE_PASSWORD` configurados como variáveis privadas do projeto. A credencial do provedor fica no processo OpenCode. O modelo selecionado é `opencode/minimax-m3.1-flash-free`. Quando o serviço ou a cota estão indisponíveis, o editor mantém o resumo e informa que o rascunho não foi gerado.

A aplicação estará disponível em:

```bash id="2l1u5m"
http://localhost:5173
```

## 📦 Build para Produção

```bash id="yvrv45"
npm run build
```

## Testes do editor

```bash
npx playwright install chromium
npm test
```

A suíte verifica a busca, os formulários, a recuperação do rascunho, a prévia de todos os modelos adicionados e downloads representativos das três famílias de PDF. O axe verifica a interface e os controles da prévia. O conteúdo dos layouts de impressão fica fora da auditoria automatizada.

## 🎯 Destaques Técnicos

* Atualização instantânea do preview
* Conversão HTML para PDF no navegador
* Arquitetura leve e performática
* Interface totalmente responsiva
* Componentes reutilizáveis
* Experiência otimizada para produtividade

## 💼 Casos de Uso

* Prestadores de serviço
* Freelancers
* Pequenas empresas
* Agências
* Consultores
* Profissionais autônomos

---

Desenvolvido por **Kayohan Costa** 🚀
