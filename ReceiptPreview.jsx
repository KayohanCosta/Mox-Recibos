import { forwardRef } from 'react'
import { Icon } from '@iconify/react'
import { templateById } from './src/templates.js'

const DOC_TYPES = {
  'recibo': 'RECIBO',
  'nota-servico': 'NOTA DE SERVIÇO',
  'fatura': 'FATURA',
  'ordem-servico': 'ORDEM DE SERVIÇO',
  'proposta': 'PROPOSTA COMERCIAL',
  'contrato': 'CONTRATO',
  'orcamento': 'ORÇAMENTO',
}

const PAYMENT_LABELS = {
  'pix': 'PIX',
  'transferencia': 'Transferência Bancária',
  'boleto': 'Boleto Bancário',
  'cartao-credito': 'Cartão de Crédito',
  'cartao-debito': 'Cartão de Débito',
  'dinheiro': 'Dinheiro',
  'cheque': 'Cheque',
  'a-prazo': 'A Prazo',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatCurrency(value, currency = 'BRL') {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'R$'
  return `${symbol} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function getLayoutType(type) {
  if (['fatura', 'ordem-servico'].includes(type)) return 'fatura'
  if (['proposta', 'contrato', 'orcamento'].includes(type)) return 'comercial'
  return 'recibo'
}

// -------------------------------------------------------------
// MODELO PADRÃO (Recibo / Nota de Serviço)
// -------------------------------------------------------------
const receiptColors = {
  ink: '#141414',
  highlight: '#ededed',
  onInk: '#d4d4d4',
  muted: '#595959',
  text: '#303030',
  surface: '#f3f3f3',
  stripe: '#fafafa',
  line: '#e0e0e0',
  strongRule: '4px solid #141414',
  noteRule: '3px solid #141414',
  signatureRule: '2px solid #141414',
}

function LayoutRecibo({ company, client, receipt, items, subtotal, details, title }) {
  const docTitle = title || DOC_TYPES[receipt.type] || 'RECIBO'
  const showPrices = !details || Boolean(details.total)
  const columns = showPrices ? '3fr 80px 70px 100px 110px' : '3fr 80px 70px'
  const headers = showPrices ? ['DESCRIÇÃO', 'QTD', 'UNIT', 'PREÇO UN.', 'TOTAL'] : ['DESCRIÇÃO', 'QTD', 'UNIT']
  return (
    <>
      <div style={{ background: receiptColors.ink, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {company.logoPreview ? (
            <img src={company.logoPreview} alt="Logo do emissor"
              style={{ maxHeight: '56px', maxWidth: '160px', objectFit: 'contain', marginBottom: '12px', display: 'block' }} />
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <img src="/mox-recibos.png" alt="Logo da Mox Recibos" width="40" height="40"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              {company.name && <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '20px', color: '#ffffff' }}>{company.name}</span>}
            </div>
          )}
          {company.name && company.logoPreview && <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: '#ffffff', marginBottom: '6px' }}>{company.name}</div>}
          {company.cnpj && <div style={{ fontSize: '12px', color: receiptColors.onInk, marginBottom: '2px' }}>CNPJ: {company.cnpj}</div>}
          {company.address && <div style={{ fontSize: '12px', color: receiptColors.onInk, marginBottom: '2px' }}>{company.address}</div>}
          {company.email && <div style={{ fontSize: '12px', color: receiptColors.onInk, marginBottom: '2px' }}>{company.email}</div>}
          {company.phone && <div style={{ fontSize: '12px', color: receiptColors.onInk }}>{company.phone}</div>}
        </div>

        <div style={{ textAlign: 'right', paddingLeft: '24px' }}>
          <div style={{ background: receiptColors.highlight, color: receiptColors.ink, padding: '8px 20px', borderRadius: '8px', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '13px', letterSpacing: '2px', marginBottom: '10px', display: 'inline-block' }}>
            {docTitle}
          </div>
          <div style={{ color: '#ffffff', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '22px' }}>#{receipt.number}</div>
          <div style={{ color: receiptColors.onInk, fontSize: '12px', marginTop: '4px' }}>{details?.date ?? 'Emissão'}: {formatDate(receipt.date)}</div>
          {!details && receipt.dueDate && <div style={{ color: receiptColors.highlight, fontSize: '12px', marginTop: '2px' }}>Vence: {formatDate(receipt.dueDate)}</div>}
        </div>
      </div>

      <div style={{ height: '5px', background: receiptColors.highlight }} />

      <div style={{ padding: '36px 48px', color: receiptColors.ink }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: receiptColors.muted, fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '10px' }}>{details?.party[1] ?? 'FATURAR PARA'}</div>
          <div style={{ background: receiptColors.surface, borderRadius: '12px', padding: '18px 22px', borderLeft: receiptColors.strongRule }}>
            <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{client.name || <span style={{ color: receiptColors.muted }}>Nome do Cliente</span>}</div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginTop: '6px' }}>
              {client.cpfCnpj && <div style={{ fontSize: '12px', color: receiptColors.muted }}><span style={{ fontWeight: 600 }}>CPF/CNPJ:</span> {client.cpfCnpj}</div>}
              {client.email && <div style={{ fontSize: '12px', color: receiptColors.muted }}><span style={{ fontWeight: 600 }}>E-mail:</span> {client.email}</div>}
              {client.phone && <div style={{ fontSize: '12px', color: receiptColors.muted }}><span style={{ fontWeight: 600 }}>Tel:</span> {client.phone}</div>}
              {client.address && <div style={{ fontSize: '12px', color: receiptColors.muted }}><span style={{ fontWeight: 600 }}>Endereço:</span> {client.address}</div>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: receiptColors.muted, fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '12px' }}>{details?.items ?? 'ITENS / SERVIÇOS'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: columns, background: receiptColors.ink, borderRadius: '8px 8px 0 0', padding: '10px 16px' }}>
            {headers.map((h, i) => (
              <div key={h} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'Cabinet Grotesk, sans-serif', color: receiptColors.highlight, textAlign: i > 0 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {items.map((item, idx) => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: columns, padding: '12px 16px', borderBottom: `1px solid ${receiptColors.line}`, background: idx % 2 === 0 ? '#ffffff' : receiptColors.stripe }}>
              <div style={{ fontSize: '13px', color: receiptColors.ink, paddingRight: '8px' }}>{item.description || <span style={{ color: '#cccccc' }}>—</span>}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', color: receiptColors.text }}>{item.quantity}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', color: receiptColors.text }}>{item.unit}</div>
              {showPrices && <div style={{ fontSize: '13px', textAlign: 'right', color: receiptColors.text }}>{formatCurrency(details ? Number(item.unitPrice) : item.unitPrice, receipt.currency)}</div>}
              {showPrices && <div style={{ fontSize: '13px', textAlign: 'right', fontWeight: 600, color: receiptColors.ink }}>{formatCurrency(item.quantity * item.unitPrice, receipt.currency)}</div>}
            </div>
          ))}
        </div>

        {showPrices && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: receiptColors.muted, fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '8px' }}>PAGAMENTO</div>
            <div style={{ background: receiptColors.surface, borderRadius: '10px', padding: '14px 18px', fontSize: '14px', fontWeight: 600, color: receiptColors.text }}>
              {PAYMENT_LABELS[receipt.paymentMethod] || 'PIX'}
            </div>
          </div>
          <div style={{ minWidth: '240px' }}>
            <div style={{ background: receiptColors.ink, borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: receiptColors.onInk }}>Subtotal</span>
                <span style={{ fontSize: '12px', color: receiptColors.onInk }}>{formatCurrency(subtotal, receipt.currency)}</span>
              </div>
              <div style={{ height: '1px', background: receiptColors.text, marginBottom: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>{details?.total ?? 'TOTAL'}</span>
                <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '22px', color: receiptColors.highlight }}>{formatCurrency(subtotal, receipt.currency)}</span>
              </div>
            </div>
          </div>
        </div>}

        {receipt.notes && (
          <div style={{ marginTop: '28px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: receiptColors.muted, fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '8px' }}>OBSERVAÇÕES</div>
            <div style={{ background: receiptColors.surface, borderRadius: '10px', padding: '16px 18px', fontSize: '13px', color: receiptColors.text, lineHeight: '1.6', borderLeft: receiptColors.noteRule }}>
              {receipt.notes}
            </div>
          </div>
        )}

        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ borderTop: receiptColors.signatureRule, paddingTop: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: receiptColors.text }}>{company.name || details?.party[0] || 'Prestador de Serviços'}</div>
              {company.cnpj && <div style={{ fontSize: '11px', color: receiptColors.muted }}>CNPJ: {company.cnpj}</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: receiptColors.highlight, padding: '12px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, color: receiptColors.ink }}>{docTitle} #{receipt.number}</span>
        <span style={{ fontSize: '11px', color: receiptColors.text }}>
          Gerado por: <a data-pdf-link href="https://mox-desenvolvimento.vercel.app/" target="_blank" rel="noopener noreferrer"
            style={{ color: receiptColors.ink, textDecoration: 'underline', fontWeight: 700 }}>moxr.vercel.app</a>
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: receiptColors.text }}>{formatDate(receipt.date)}</span>
      </div>
    </>
  )
}

// -------------------------------------------------------------
// MODELO FATURA (Fatura / Ordem de Serviço)
// -------------------------------------------------------------
function LayoutFatura({ company, client, receipt, items, subtotal, details, title }) {
  const docTitle = title || DOC_TYPES[receipt.type] || 'FATURA'
  return (
    <>
      <div style={{ padding: '48px', borderBottom: '4px solid #171e19' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          {company.logoPreview ? (
            <img src={company.logoPreview} alt="Logo" style={{ maxHeight: '64px', maxWidth: '180px', objectFit: 'contain', display: 'block' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#ffe17c', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#171e19', border: '2px solid #171e19' }}>
                <Icon icon="ph:receipt-bold" />
              </div>
              {company.name && <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '28px', color: '#171e19' }}>{company.name}</span>}
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '36px', color: '#171e19', margin: 0, letterSpacing: '-1px' }}>{docTitle}</h1>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#888888' }}>Nº {receipt.number}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaaaaa', fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '8px' }}>{details?.party[0] ?? 'DE (FORNECEDOR)'}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19', marginBottom: '4px' }}>{company.name || 'Nome da Empresa'}</div>
            {company.cnpj && <div style={{ fontSize: '12px', color: '#555' }}>CNPJ: {company.cnpj}</div>}
            {company.address && <div style={{ fontSize: '12px', color: '#555' }}>{company.address}</div>}
            {company.email && <div style={{ fontSize: '12px', color: '#555' }}>{company.email}</div>}
            {company.phone && <div style={{ fontSize: '12px', color: '#555' }}>{company.phone}</div>}
          </div>
          
          <div style={{ flex: 1, paddingLeft: '24px', borderLeft: '2px dashed #eeeeee' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaaaaa', fontFamily: 'Cabinet Grotesk, sans-serif', marginBottom: '8px' }}>{details?.party[1] ?? 'PARA (CLIENTE)'}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19', marginBottom: '4px' }}>{client.name || 'Nome do Cliente'}</div>
            {client.cpfCnpj && <div style={{ fontSize: '12px', color: '#555' }}>Doc: {client.cpfCnpj}</div>}
            {client.address && <div style={{ fontSize: '12px', color: '#555' }}>{client.address}</div>}
            {client.email && <div style={{ fontSize: '12px', color: '#555' }}>{client.email}</div>}
            {client.phone && <div style={{ fontSize: '12px', color: '#555' }}>{client.phone}</div>}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 48px', display: 'flex' }}>
         <div style={{ flex: 1, padding: '20px 0', borderRight: '1px solid #eeeeee' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#aaaaaa' }}>DATA DE EMISSÃO</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#171e19' }}>{formatDate(receipt.date)}</div>
         </div>
         {receipt.dueDate && (
            <div style={{ flex: 1, padding: '20px 0', paddingLeft: '24px', borderRight: '1px solid #eeeeee' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#aaaaaa' }}>VENCIMENTO</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ce5252' }}>{formatDate(receipt.dueDate)}</div>
            </div>
         )}
         <div style={{ flex: 1, padding: '20px 0', paddingLeft: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#aaaaaa' }}>VALOR TOTAL</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#171e19' }}>{formatCurrency(subtotal, receipt.currency)}</div>
         </div>
      </div>
      
      <div style={{ borderBottom: '1px solid #eeeeee' }} />

      <div style={{ padding: '36px 48px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 70px 100px 110px', borderBottom: '2px solid #171e19', paddingBottom: '10px', marginBottom: '8px' }}>
            {[details?.items.toLocaleUpperCase('pt-BR') ?? 'DESCRIÇÃO', 'QTD', 'UNIT', 'PREÇO UN.', 'TOTAL'].map((h, i) => (
              <div key={h} style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', fontFamily: 'Cabinet Grotesk, sans-serif', color: '#171e19', textAlign: i > 0 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {items.map((item, idx) => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 70px 100px 110px', padding: '14px 0', borderBottom: '1px solid #eeeeee' }}>
              <div style={{ fontSize: '13px', color: '#171e19', paddingRight: '8px', fontWeight: 600 }}>{item.description || <span style={{ color: '#cccccc' }}>—</span>}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', color: '#555' }}>{item.quantity}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', color: '#555' }}>{item.unit}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', color: '#555' }}>{formatCurrency(details ? Number(item.unitPrice) : item.unitPrice, receipt.currency)}</div>
              <div style={{ fontSize: '13px', textAlign: 'right', fontWeight: 700, color: '#171e19' }}>{formatCurrency(item.quantity * item.unitPrice, receipt.currency)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '300px', background: '#fafafa', border: '2px solid #171e19', borderRadius: '12px', padding: '24px', boxShadow: '4px 4px 0px 0px #171e19' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>Subtotal</span>
                <span style={{ fontSize: '13px', color: '#171e19', fontWeight: 700 }}>{formatCurrency(subtotal, receipt.currency)}</span>
              </div>
              <div style={{ height: '2px', background: '#eeeeee', marginBottom: '12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '16px', color: '#171e19' }}>{details?.total.toLocaleUpperCase('pt-BR') ?? 'TOTAL DEVIDO'}</span>
                <span style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '24px', color: '#171e19' }}>{formatCurrency(subtotal, receipt.currency)}</span>
              </div>
          </div>
        </div>

        <div style={{ background: '#ffe17c', borderRadius: '12px', padding: '20px', border: '2px solid #171e19', display: 'flex', gap: '20px', alignItems: 'center' }}>
           <div style={{ fontSize: '32px' }}>⚡</div>
           <div>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Cabinet Grotesk, sans-serif', color: '#171e19', marginBottom: '4px' }}>Instruções de Pagamento</div>
              <div style={{ fontSize: '13px', color: '#171e19', fontWeight: 600 }}>Método: {PAYMENT_LABELS[receipt.paymentMethod] || 'A combinar'}</div>
              {receipt.notes && <div style={{ fontSize: '12px', color: '#171e19', marginTop: '4px', opacity: 0.8 }}>{receipt.notes}</div>}
           </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#171e19', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 700, color: '#ffffff' }}>{docTitle} #{receipt.number}</span>
        <span style={{ fontSize: '12px', color: '#888888' }}>Documento gerado oficialmente por Mox Recibos</span>
      </div>
    </>
  )
}

// -------------------------------------------------------------
// MODELO COMERCIAL (Proposta / Contrato / Orçamento)
// -------------------------------------------------------------
function LayoutComercial({ company, client, receipt, items, subtotal, details, title }) {
  const docTitle = title || DOC_TYPES[receipt.type] || 'PROPOSTA'
  const contract = receipt.type === 'contrato' || details?.contract
  const rows = contract ? items.filter(item => item.description.trim() || item.unitPrice !== '') : items
  const showTotal = !contract || rows.some(item => item.unitPrice !== '')
  const clauses = contract ? (receipt.clauses ?? []).filter(clause => clause.title.trim() || clause.text.trim()) : []
  return (
    <>
      <div style={{ padding: '64px 48px 32px 48px', textAlign: 'center' }}>
         {company.logoPreview ? (
            <img src={company.logoPreview} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', margin: '0 auto 24px auto', display: 'block' }} />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', background: '#ffe17c', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#171e19', border: '2px solid #171e19', boxShadow: '4px 4px 0px 0px #171e19' }}>
                <Icon icon="ph:receipt-bold" />
              </div>
            </div>
          )}
          <h1 style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 900, fontSize: '42px', color: '#171e19', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{docTitle}</h1>
          <div style={{ fontSize: '14px', color: '#555', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
             Apresentado por <strong style={{color: '#171e19'}}>{company.name || 'Nossa Empresa'}</strong> para <strong style={{color: '#171e19'}}>{client.name || 'Cliente'}</strong> em {formatDate(receipt.date)}.
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Ref: #{receipt.number}</div>
      </div>

      <div style={{ padding: '0 48px' }}>
          <div style={{ background: '#f8f8f8', border: '1px solid #ddd', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '14px', color: '#171e19', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Partes Envolvidas</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                 <div>
                    <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '4px' }}>{details?.party[0].toLocaleUpperCase('pt-BR') ?? 'CONTRATADA'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19' }}>{company.name || <span style={{ color: '#cccccc' }}>Nome da Empresa</span>}</div>
                    <div style={{ fontSize: '13px', color: '#555' }}>{company.cnpj && `CNPJ: ${company.cnpj}`}</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '4px' }}>{details?.party[1].toLocaleUpperCase('pt-BR') ?? 'CONTRATANTE'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19' }}>{client.name || <span style={{ color: '#cccccc' }}>Nome do Cliente</span>}</div>
                    <div style={{ fontSize: '13px', color: '#555' }}>{client.cpfCnpj && `Doc: ${client.cpfCnpj}`}</div>
                 </div>
              </div>
          </div>

          {(rows.length > 0 || !contract) && <div style={{ marginBottom: '40px' }}>
              <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '16px', color: '#171e19', marginBottom: '16px', borderBottom: '2px solid #171e19', paddingBottom: '8px' }}>
                 {details?.items ?? (contract ? 'Escopo do contrato' : 'Escopo / Produtos Relacionados')}
              </div>
              <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                 {rows.map((item, idx) => (
                   <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: idx !== rows.length - 1 ? '1px solid #eee' : 'none', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <div style={contract ? { minWidth: 0, paddingRight: '12px' } : undefined}>
                         <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19', marginBottom: '4px', ...(contract && { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }) }}>{item.description || (contract ? 'Entrega' : 'Item')}</div>
                         {(!contract || item.unitPrice !== '' || Number(item.quantity) !== 1 || item.unit !== 'un') && (
                           <div style={{ fontSize: '12px', color: '#888' }}>
                             Qtd: {item.quantity} {item.unit}
                             {(!contract || item.unitPrice !== '') && <> | Unitário: {formatCurrency(contract || details ? Number(item.unitPrice) : item.unitPrice, receipt.currency)}</>}
                           </div>
                         )}
                      </div>
                      {(!contract || item.unitPrice !== '') && <div style={{ fontSize: '15px', fontWeight: 800, color: '#171e19' }}>
                         {formatCurrency(item.quantity * item.unitPrice, receipt.currency)}
                      </div>}
                   </div>
                 ))}
                 {showTotal && <div style={{ background: '#171e19', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{contract ? 'TOTAL DO CONTRATO' : details?.total.toLocaleUpperCase('pt-BR') ?? 'TOTAL DA PROPOSTA'}</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffe17c' }}>{formatCurrency(subtotal, receipt.currency)}</div>
                 </div>}
              </div>
          </div>}

          {(receipt.notes || (contract && (clauses.length > 0 || showTotal || receipt.dueDate))) && (
             <div style={{ marginBottom: '40px' }}>
                <div style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontWeight: 800, fontSize: '16px', color: '#171e19', marginBottom: '16px', borderBottom: '2px solid #171e19', paddingBottom: '8px' }}>
                   {contract ? 'Cláusulas e condições' : 'Termos & Condições'}
                </div>
                {clauses.length > 0 && (
                  <ol style={{ padding: 0, margin: '0 0 14px', listStyle: 'none' }}>
                    {clauses.map((clause, index) => (
                      <li key={clause.id} style={{ fontSize: '13px', color: '#444', marginBottom: '12px', overflowWrap: 'anywhere' }}>
                        <strong>Cláusula {index + 1}{clause.title.trim() && ` · ${clause.title.trim()}`}</strong>
                        {clause.text.trim() && <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{clause.text}</div>}
                      </li>
                    ))}
                  </ol>
                )}
                {receipt.notes && <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                   {receipt.notes}
                </div>}
                {(!contract || showTotal || receipt.dueDate) && <div style={{ marginTop: '16px', fontSize: '13px', color: '#444' }}>
                   {(!contract || showTotal) && <><strong>Condição de Pagamento:</strong> {PAYMENT_LABELS[receipt.paymentMethod] || 'A combinar'}</>}
                   {receipt.dueDate && <span>{(!contract || showTotal) && ' | '}<strong>{contract ? 'Fim da vigência:' : 'Validade/Vencimento:'}</strong> {formatDate(receipt.dueDate)}</span>}
                </div>}
             </div>
          )}

          <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ borderTop: '2px solid #171e19', paddingTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19' }}>{company.name || details?.party[0] || 'CONTRATADA'}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Assinatura e Carimbo</div>
                 </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ borderTop: '2px solid #171e19', paddingTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#171e19' }}>{client.name || details?.party[1] || 'CONTRATANTE'}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>De Acordo</div>
                 </div>
              </div>
          </div>
      </div>
    </>
  )
}

const ReceiptPreview = forwardRef(function ReceiptPreview({ company, client, receipt, items, subtotal }, ref) {
  const template = templateById[receipt.type]
  const layoutType = template?.layout ?? getLayoutType(receipt.type)
  const details = template?.details
  const title = details ? template.name.toLocaleUpperCase('pt-BR') : undefined
  const props = { company, client, receipt, items, subtotal, details, title }

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        minHeight: '1123px',
        background: '#ffffff',
        fontFamily: 'Satoshi, sans-serif',
        color: '#171e19',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {layoutType === 'recibo' && <LayoutRecibo {...props} />}
      {layoutType === 'fatura' && <LayoutFatura {...props} />}
      {layoutType === 'comercial' && <LayoutComercial {...props} />}
    </div>
  )
})

export default ReceiptPreview
