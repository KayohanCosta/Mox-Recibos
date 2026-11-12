import { BriefcaseBusiness, Building2, CalendarDays, ClipboardList, GraduationCap, HeartHandshake, House, PackageCheck, Receipt, ShoppingBag, Wrench } from 'lucide-react'

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
