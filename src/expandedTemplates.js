import { BedDouble, BriefcaseBusiness, Building2, CalendarDays, ClipboardList, Dumbbell, GraduationCap, HeartHandshake, House, Laptop, PackageCheck, Palette, Receipt, ShoppingBag, Truck, Wrench } from 'lucide-react'

// Each model uses one of the existing print layouts. A total enables monetary fields.
const groups = [
  {
    category: 'financeiro', layout: 'recibo', icon: Receipt, models: [
      ['reembolso', 'Recibo de reembolso', 'Registre as despesas e o valor devolvido.', 'Responsável pelo reembolso', 'Pessoa reembolsada', 'Despesas reembolsadas', 'Total reembolsado'],
      ['recibo-adiantamento', 'Recibo de adiantamento', 'Comprove o recebimento de um valor antecipado.', 'Quem recebeu', 'Quem pagou', 'Adiantamentos', 'Total recebido'],
      ['recibo-parcela', 'Recibo de parcela', 'Identifique a parcela e o pagamento recebido.', 'Quem recebeu', 'Quem pagou', 'Parcelas pagas', 'Total recebido'],
      ['recibo-caucao', 'Recibo de caução', 'Registre o valor recebido como garantia.', 'Quem recebeu a caução', 'Depositante', 'Valores recebidos', 'Total recebido'],
      ['recibo-devolucao', 'Recibo de devolução de valores', 'Comprove a devolução integral ou parcial de um pagamento.', 'Responsável pela devolução', 'Beneficiário', 'Valores devolvidos', 'Total devolvido'],
    ],
  },
  {
    category: 'servicos', layout: 'recibo', icon: Wrench, models: [
      ['relatorio-servicos', 'Relatório de serviços', 'Descreva as atividades realizadas e seus resultados.', 'Prestador de serviços', 'Cliente', 'Atividades realizadas'],
      ['relatorio-manutencao', 'Relatório de manutenção', 'Liste inspeções, ajustes e reparos executados.', 'Responsável pela manutenção', 'Solicitante', 'Inspeções e reparos'],
      ['comprovante-visita', 'Comprovante de visita técnica', 'Registre o atendimento e as verificações da visita.', 'Técnico responsável', 'Cliente', 'Verificações realizadas'],
      ['aceite-servico', 'Termo de aceite de serviço', 'Relacione as entregas apresentadas para aceite.', 'Prestador de serviços', 'Responsável pelo aceite', 'Entregas para aceite'],
    ],
  },
  {
    category: 'comercial', layout: 'comercial', icon: BriefcaseBusiness, models: [
      ['proposta-patrocinio', 'Proposta de patrocínio', 'Apresente cotas e contrapartidas a um potencial patrocinador.', 'Proponente', 'Potencial patrocinador', 'Cotas e contrapartidas', 'Total da proposta'],
      ['proposta-consultoria', 'Proposta de consultoria', 'Apresente etapas, entregas e valores de consultoria.', 'Consultoria', 'Cliente', 'Etapas e entregas', 'Total da proposta'],
      ['orcamento-producao', 'Orçamento de produção', 'Estime custos de materiais, produção e serviços.', 'Responsável pela produção', 'Cliente', 'Materiais e serviços', 'Total estimado'],
    ],
  },
  {
    category: 'vendas', layout: 'fatura', icon: ShoppingBag, models: [
      ['pedido-compra', 'Pedido de compra', 'Formalize a solicitação de produtos a um fornecedor.', 'Comprador', 'Fornecedor', 'Produtos solicitados', 'Total do pedido'],
      ['pedido-venda', 'Pedido de venda', 'Registre produtos, quantidades e valores combinados.', 'Vendedor', 'Comprador', 'Produtos vendidos', 'Total do pedido'],
      ['demonstrativo-cobranca', 'Demonstrativo de cobrança', 'Detalhe os valores de uma cobrança em aberto.', 'Responsável pela cobrança', 'Cliente', 'Valores cobrados', 'Total devido'],
    ],
  },
  {
    category: 'logistica', layout: 'recibo', icon: PackageCheck, models: [
      ['comprovante-entrega', 'Comprovante de entrega', 'Registre os itens entregues e quem os recebeu.', 'Remetente', 'Destinatário', 'Itens entregues'],
      ['comprovante-retirada', 'Comprovante de retirada', 'Liste os volumes retirados e identifique o responsável.', 'Responsável pela entrega', 'Responsável pela retirada', 'Volumes retirados'],
      ['devolucao-mercadoria', 'Comprovante de devolução de mercadoria', 'Registre os produtos devolvidos e suas quantidades.', 'Responsável pela devolução', 'Destinatário', 'Produtos devolvidos'],
      ['transferencia-estoque', 'Registro de transferência de estoque', 'Identifique a origem, o destino e os itens movimentados.', 'Unidade de origem', 'Unidade de destino', 'Itens transferidos'],
    ],
  },
  {
    category: 'imoveis', layout: 'recibo', icon: House, models: [
      ['recibo-aluguel', 'Recibo de aluguel', 'Registre o pagamento do aluguel e o período correspondente.', 'Locador', 'Locatário', 'Períodos e valores', 'Total recebido'],
      ['entrega-chaves', 'Termo de entrega de chaves', 'Identifique as chaves entregues e quem as recebeu.', 'Responsável pela entrega', 'Responsável pelo recebimento', 'Chaves e acessos'],
      ['relatorio-vistoria', 'Relatório de vistoria de imóvel', 'Relacione ambientes, itens inspecionados e observações.', 'Responsável pela vistoria', 'Interessado', 'Ambientes e itens vistoriados'],
    ],
  },
  {
    category: 'educacao', layout: 'recibo', icon: GraduationCap, models: [
      ['declaracao-participacao', 'Declaração de participação', 'Registre a participação em oficinas, cursos ou atividades.', 'Organização responsável', 'Participante', 'Atividades e carga horária'],
      ['comprovante-material', 'Comprovante de entrega de material didático', 'Liste os materiais entregues ao aluno ou responsável.', 'Instituição de ensino', 'Aluno ou responsável', 'Materiais entregues'],
      ['recibo-mensalidade', 'Recibo de mensalidade escolar', 'Identifique as mensalidades recebidas e seus períodos.', 'Instituição de ensino', 'Responsável financeiro', 'Mensalidades pagas', 'Total recebido'],
    ],
  },
  {
    category: 'eventos', layout: 'recibo', icon: CalendarDays, models: [
      ['confirmacao-inscricao', 'Confirmação de inscrição', 'Registre inscrições em eventos, cursos e oficinas.', 'Organização do evento', 'Participante', 'Inscrições e atividades'],
      ['recibo-inscricao', 'Recibo de inscrição', 'Comprove o recebimento de taxas de inscrição.', 'Organização do evento', 'Participante', 'Inscrições pagas', 'Total recebido'],
      ['entrega-credenciais', 'Comprovante de entrega de credenciais', 'Identifique as credenciais e os materiais retirados.', 'Organização do evento', 'Responsável pela retirada', 'Credenciais e materiais'],
    ],
  },
  {
    category: 'organizacoes', layout: 'recibo', icon: HeartHandshake, models: [
      ['recibo-doacao', 'Recibo de doação em dinheiro', 'Registre valores recebidos por uma organização.', 'Organização beneficiária', 'Doador', 'Doações recebidas', 'Total recebido'],
      ['doacao-bens', 'Comprovante de doação de bens', 'Relacione os bens doados e suas quantidades.', 'Doador', 'Organização beneficiária', 'Bens doados'],
      ['recibo-contribuicao', 'Recibo de contribuição associativa', 'Comprove contribuições recebidas de associados.', 'Associação', 'Associado', 'Contribuições recebidas', 'Total recebido'],
    ],
  },
  {
    category: 'administrativo', layout: 'recibo', icon: Building2, models: [
      ['protocolo-documentos', 'Protocolo de recebimento de documentos', 'Relacione os documentos recebidos em um atendimento.', 'Responsável pelo recebimento', 'Responsável pelo envio', 'Documentos recebidos'],
      ['entrega-equipamentos', 'Termo de entrega de equipamentos', 'Registre os equipamentos entregues a uma pessoa ou equipe.', 'Responsável pela entrega', 'Responsável pelos equipamentos', 'Equipamentos entregues'],
      ['emprestimo-bens', 'Termo de empréstimo de bens', 'Relacione os bens emprestados e quem os recebeu.', 'Responsável pelos bens', 'Pessoa que recebeu os bens', 'Bens emprestados'],
      ['relatorio-atividades', 'Relatório de atividades', 'Organize atividades e resultados de uma equipe ou projeto.', 'Responsável pelo relatório', 'Destinatário', 'Atividades e resultados'],
    ],
  },
  {
    category: 'hospedagem', layout: 'recibo', icon: BedDouble, models: [
      ['recibo-hospedagem', 'Recibo de hospedagem', 'Registre o pagamento de diárias, taxas e serviços da estadia.', 'Estabelecimento', 'Hóspede ou responsável', 'Diárias e serviços', 'Total recebido'],
      ['confirmacao-reserva-hospedagem', 'Confirmação de reserva de hospedagem', 'Confirme acomodações e informe o período da reserva nas observações.', 'Estabelecimento', 'Hóspede ou responsável', 'Acomodações reservadas'],
      ['recibo-sinal-hospedagem', 'Recibo de sinal de hospedagem', 'Identifique a reserva e o sinal recebido para garanti-la.', 'Estabelecimento', 'Hóspede ou responsável', 'Sinal recebido', 'Total recebido'],
      ['registro-inspecao-acomodacao', 'Registro de inspeção de acomodação', 'Relacione itens conferidos na entrada ou saída do hóspede.', 'Responsável pela inspeção', 'Hóspede ou responsável', 'Itens conferidos'],
    ],
  },
  {
    category: 'hospedagem', layout: 'fatura', icon: BedDouble, models: [
      ['demonstrativo-extras-hospedagem', 'Demonstrativo de despesas da estadia', 'Detalhe consumos e serviços adicionais cobrados durante a hospedagem.', 'Estabelecimento', 'Hóspede ou responsável', 'Despesas da estadia', 'Total das despesas'],
    ],
  },
  {
    category: 'transporte', layout: 'recibo', icon: Truck, models: [
      ['recibo-frete', 'Recibo de frete', 'Registre o pagamento do frete e identifique a carga transportada.', 'Transportador', 'Contratante do frete', 'Fretes pagos', 'Total recebido'],
      ['recibo-estacionamento', 'Recibo de estacionamento', 'Registre o pagamento e informe placa e período nas observações.', 'Operador do estacionamento', 'Responsável pelo veículo', 'Períodos e serviços', 'Total recebido'],
      ['registro-coleta-carga', 'Registro de coleta de carga', 'Identifique os volumes coletados para transporte.', 'Transportador', 'Responsável pela expedição', 'Volumes coletados'],
      ['relatorio-viagem', 'Relatório de viagem a serviço', 'Relacione deslocamentos e atividades realizadas na viagem.', 'Responsável pela viagem', 'Solicitante', 'Deslocamentos e atividades'],
    ],
  },
  {
    category: 'transporte', layout: 'fatura', icon: Truck, models: [
      ['demonstrativo-despesas-transporte', 'Demonstrativo de despesas de transporte', 'Discrimine combustível, pedágios, passagens e outros custos de deslocamento.', 'Responsável pelas despesas', 'Responsável pela conferência', 'Despesas de transporte', 'Total das despesas'],
    ],
  },
  {
    category: 'esportes', layout: 'recibo', icon: Dumbbell, models: [
      ['recibo-mensalidade-esportiva', 'Recibo de mensalidade esportiva', 'Registre pagamentos de mensalidades de academias, clubes ou escolinhas.', 'Organização esportiva', 'Aluno ou responsável', 'Mensalidades pagas', 'Total recebido'],
      ['recibo-taxa-competicao', 'Recibo de taxa de competição', 'Comprove o recebimento da inscrição de atletas ou equipes.', 'Organização da competição', 'Atleta ou responsável pela equipe', 'Taxas pagas', 'Total recebido'],
      ['recibo-locacao-quadra', 'Recibo de locação de quadra', 'Registre o pagamento pela reserva de uma instalação esportiva.', 'Responsável pela instalação', 'Responsável pela reserva', 'Horários e espaços locados', 'Total recebido'],
      ['entrega-kit-esportivo', 'Comprovante de entrega de kit esportivo', 'Relacione uniformes, acessórios ou materiais entregues aos participantes.', 'Responsável pela entrega', 'Atleta ou responsável', 'Materiais entregues'],
      ['registro-sessoes-treino', 'Registro de sessões de treino', 'Relacione sessões realizadas e observações sobre o acompanhamento.', 'Treinador ou instrutor', 'Atleta ou equipe', 'Sessões realizadas'],
    ],
  },
  {
    category: 'tecnologia', layout: 'recibo', icon: Laptop, models: [
      ['relatorio-suporte-ti', 'Relatório de atendimento de TI', 'Documente chamados atendidos, ações executadas e resultados.', 'Equipe de suporte', 'Solicitante', 'Chamados e ações realizadas'],
      ['aceite-entrega-software', 'Termo de aceite de entrega de software', 'Relacione funcionalidades e versões apresentadas para conferência.', 'Equipe responsável pela entrega', 'Responsável pelo aceite', 'Funcionalidades e versões entregues'],
      ['registro-inventario-ti', 'Registro de inventário de TI', 'Liste equipamentos, licenças ou ativos conferidos.', 'Equipe de TI', 'Unidade responsável', 'Ativos conferidos'],
    ],
  },
  {
    category: 'tecnologia', layout: 'comercial', icon: Laptop, models: [
      ['proposta-desenvolvimento-software', 'Proposta de desenvolvimento de software', 'Apresente etapas, funcionalidades, entregas e investimento do projeto.', 'Equipe de desenvolvimento', 'Cliente', 'Etapas e funcionalidades', 'Total da proposta'],
      ['proposta-implantacao-sistema', 'Proposta de implantação de sistema', 'Detalhe migração, configuração, treinamento e acompanhamento.', 'Responsável pela implantação', 'Cliente', 'Etapas de implantação', 'Total da proposta'],
    ],
  },
  {
    category: 'criativo', layout: 'comercial', icon: Palette, models: [
      ['orcamento-fotografia', 'Orçamento de fotografia', 'Estime sessões, tratamento de imagens e formatos de entrega.', 'Fotógrafo ou estúdio', 'Cliente', 'Sessões e entregas', 'Total estimado'],
      ['proposta-identidade-visual', 'Proposta de identidade visual', 'Apresente etapas de criação, peças e materiais da marca.', 'Designer ou estúdio', 'Cliente', 'Etapas e peças previstas', 'Total da proposta'],
      ['proposta-producao-audiovisual', 'Proposta de produção audiovisual', 'Detalhe roteiro, captação, edição e arquivos finais.', 'Produtora ou profissional', 'Cliente', 'Etapas de produção e entregas', 'Total da proposta'],
      ['orcamento-edicao-video', 'Orçamento de edição de vídeo', 'Estime montagem, revisões, legendagem e versões finais.', 'Editor ou estúdio', 'Cliente', 'Serviços de edição', 'Total estimado'],
      ['orcamento-impressao-grafica', 'Orçamento de impressão gráfica', 'Especifique tiragens, acabamentos e valores de materiais impressos.', 'Gráfica ou fornecedor', 'Cliente', 'Tiragens e acabamentos', 'Total estimado'],
    ],
  },
]

const dateLabels = {
  reembolso: 'Data do reembolso',
  'comprovante-entrega': 'Data da entrega',
  'relatorio-servicos': 'Data do relatório',
}

export const expandedTemplates = groups.flatMap(({ category, layout, icon, models }) =>
  models.map(([id, name, description, issuer, recipient, items, total]) => ({
    id, category, layout, icon: id === 'relatorio-servicos' ? ClipboardList : icon, name, description,
    details: {
      party: [issuer, recipient],
      date: dateLabels[id] ?? 'Data de emissão',
      items,
      total,
      due: layout !== 'recibo',
      notes: layout === 'comercial' ? 'Termos e condições' : 'Observações',
    },
  })),
)
