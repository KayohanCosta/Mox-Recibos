import { ClipboardList, FileCheck, FileSignature, FileText, Receipt, ScrollText, Wrench } from 'lucide-react'

export const categories = [
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'comercial', label: 'Comercial' },
]

export const templates = [
  { id: 'recibo', category: 'financeiro', name: 'Recibo', description: 'Comprove o recebimento de um pagamento.', icon: Receipt },
  { id: 'fatura', category: 'financeiro', name: 'Fatura', description: 'Detalhe valores e condições de cobrança.', icon: FileText },
  { id: 'nota-servico', category: 'servicos', name: 'Nota de serviço', description: 'Registre os serviços prestados ao cliente.', icon: ClipboardList },
  { id: 'ordem-servico', category: 'servicos', name: 'Ordem de serviço', description: 'Formalize um trabalho a ser realizado.', icon: Wrench },
  { id: 'proposta', category: 'comercial', name: 'Proposta comercial', description: 'Apresente escopo, valores e condições.', icon: FileCheck },
  { id: 'orcamento', category: 'comercial', name: 'Orçamento', description: 'Estime o custo de produtos ou serviços.', icon: ScrollText },
  { id: 'contrato', category: 'comercial', name: 'Contrato', description: 'Documente um acordo entre as partes.', icon: FileSignature },
]

export const newItem = (id) => ({ id, description: '', quantity: '1', unit: 'un', unitPrice: '' })
export const itemTotal = ({ quantity, unitPrice }) => (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)
export const money = (value, currency) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
