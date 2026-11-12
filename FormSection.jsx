import { useId, useState } from 'react'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { categories, documentDetails, itemTotal, money, newItem, templates } from './src/templates.js'

const paymentOptions = [
  ['pix', 'Pix'], ['transferencia', 'Transferência'], ['boleto', 'Boleto'],
  ['cartao-credito', 'Cartão de crédito'], ['cartao-debito', 'Cartão de débito'],
  ['dinheiro', 'Dinheiro'], ['cheque', 'Cheque'], ['a-prazo', 'A prazo'],
]
const currencyOptions = [['BRL', 'BRL · Real'], ['USD', 'USD · Dólar'], ['EUR', 'EUR · Euro']]
const unitOptions = ['un', 'hr', 'dia', 'mês', 'kg', 'm²', 'km', 'proj'].map(unit => [unit, unit])
const templateOptions = categories.map(category => ({
  ...category,
  options: templates.filter(template => template.category === category.id).map(({ id, name }) => [id, name]),
}))

function Field({ label, value, onChange, type = 'text', placeholder, options, groups, validate, min, autoComplete, autoFocus }) {
  const id = useId()
  const [touched, setTouched] = useState(false)
  const error = touched && validate?.(value)
  const props = {
    id, value, autoFocus, onChange: event => onChange(event.target.value), onBlur: () => setTouched(true),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {options || groups
        ? <select {...props}>
            {options?.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
            {groups?.map(group => (
              <optgroup key={group.id} label={group.label}>
                {group.options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
              </optgroup>
            ))}
          </select>
        : type === 'textarea'
          ? <textarea {...props} rows={4} placeholder={placeholder} />
          : <input {...props} type={type} placeholder={placeholder} min={min}
              step={type === 'number' ? 'any' : undefined} autoComplete={autoComplete} />}
      {error && <small className="field-error" id={`${id}-error`}>{error}</small>}
    </div>
  )
}

function LogoField({ logo, onChange }) {
  const id = useId()
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)

  async function readLogo(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Escolha uma imagem de até 5 MB.')
      return
    }

    const reader = new FileReader()
    setReading(true)
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        onChange(reader.result)
        setReading(false)
      }
      image.onerror = reader.onerror
      image.src = reader.result
    }
    reader.onerror = () => {
      setError('Não foi possível abrir a imagem. Escolha outro arquivo.')
      setReading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="logo-field">
      <span className="field-label">Logo da empresa <small>Opcional</small></span>
      <div className="logo-box">
        {logo
          ? <img src={logo} alt="Logo da empresa" />
          : <span className="upload-icon"><ImagePlus size={19} aria-hidden="true" /></span>}
        <div className="logo-actions">
          <input className="upload-input" id={id} type="file" accept="image/*" onChange={readLogo}
            aria-label={logo ? 'Trocar imagem' : 'Selecionar imagem'} disabled={reading} />
          <label htmlFor={id} className="upload-link">{reading ? 'Abrindo imagem…' : logo ? 'Trocar imagem' : 'Selecionar imagem'}</label>
          {logo && <button className="text-button" disabled={reading} onClick={() => { onChange(null); setError('') }}>Remover logo</button>}
          {!logo && <small>Imagem de até 5 MB</small>}
        </div>
      </div>
      {error && <small className="field-error" role="alert">{error}</small>}
    </div>
  )
}

const emailError = value => value && !/^[^\s@]+@[^\s@]+$/.test(value) && 'Informe um e-mail válido.'
const amountError = value => Number(value) < 0 && 'Informe um valor igual ou maior que zero.'

function PartyFields({ party, change, company, contextual }) {
  return (
    <>
      <Field label={company && !contextual ? 'Nome da empresa' : 'Nome ou razão social'} value={party.name} onChange={change('name')}
        placeholder={company ? 'Ex.: Estúdio Almeida' : 'Ex.: Marina Costa'} autoComplete={company ? 'organization' : 'name'} />
      <div className="field-row">
        <Field label={company ? 'CNPJ' : 'CPF ou CNPJ'} value={company ? party.cnpj : party.cpfCnpj}
          onChange={change(company ? 'cnpj' : 'cpfCnpj')} placeholder={company ? '00.000.000/0001-00' : '000.000.000-00'} />
        <Field label="Telefone" value={party.phone} onChange={change('phone')} type="tel" autoComplete="tel" placeholder="(00) 00000-0000" />
      </div>
      <Field label="E-mail" type="email" value={party.email} onChange={change('email')} autoComplete="email"
        validate={emailError} placeholder={company ? 'contato@empresa.com.br' : 'cliente@exemplo.com'} />
      <Field label="Endereço" value={party.address} onChange={change('address')} autoComplete="street-address"
        placeholder="Rua, número, bairro, cidade e UF" />
      {company && <LogoField logo={party.logoPreview} onChange={change('logoPreview')} />}
    </>
  )
}

function DocumentFields({ receipt, change, details }) {
  const proposal = ['proposta', 'orcamento'].includes(receipt.type)
  const contract = receipt.type === 'contrato' || details?.contract
  return (
    <>
      <div className="field-row">
        <Field label="Tipo de documento" value={receipt.type} onChange={change('type')}
          groups={templateOptions} />
        <Field label="Número do documento" value={receipt.number} onChange={change('number')} placeholder="001" />
      </div>
      <div className="field-row">
        <Field label={details?.date ?? (proposal ? 'Data da proposta' : contract ? 'Data do contrato' : 'Data de emissão')}
          type="date" value={receipt.date} onChange={change('date')} />
        {(!details || details.due) && <Field label={proposal ? 'Válido até' : contract ? 'Fim da vigência' : 'Data de vencimento'}
          type="date" value={receipt.dueDate} onChange={change('dueDate')}
          validate={value => value && receipt.date && value < receipt.date && 'A data deve ser igual ou posterior à data inicial.'} />}
      </div>
      {(!details || details.total) && <div className="field-row">
        <Field label={proposal || contract ? 'Condição de pagamento' : 'Forma de pagamento'} value={receipt.paymentMethod}
          onChange={change('paymentMethod')} options={paymentOptions} />
        <Field label="Moeda" value={receipt.currency} onChange={change('currency')} options={currencyOptions} />
      </div>}
      {!contract && <Field label={details?.notes ?? 'Observações'} type="textarea" value={receipt.notes} onChange={change('notes')}
        placeholder={details ? 'Informações adicionais' : 'Informações adicionais ou instruções de pagamento'} />}
    </>
  )
}

function ItemsFields({ items, subtotal, currency, update, details, contract }) {
  const addButtonId = useId()
  const showPrices = !details || Boolean(details.total)
  const entryName = contract ? 'Entrega' : 'Item'
  return (
    <>
      {items.map((item, index) => {
        const change = field => value => update(current => current.map(row => row.id === item.id ? { ...row, [field]: value } : row))
        const quantityFields = <>
          <Field label="Quantidade" type="number" min="0" value={item.quantity} onChange={change('quantity')} validate={amountError} />
          <Field label="Unidade" value={item.unit} onChange={change('unit')} options={unitOptions} />
        </>
        return (
          <fieldset className="item-fields" key={item.id}>
            <legend>{entryName} {index + 1}</legend>
            {items.length > 1 && <button className="icon-button remove-item" aria-label={`Remover ${entryName.toLowerCase()} ${index + 1}`}
              onClick={() => {
                update(current => current.filter(row => row.id !== item.id))
                document.getElementById(addButtonId)?.focus()
              }}><Trash2 size={17} aria-hidden="true" /></button>}
            <Field label={contract ? 'Escopo ou entrega' : 'Descrição'} type={contract ? 'textarea' : 'text'}
              value={item.description} onChange={change('description')}
              placeholder={contract ? 'Descreva o que foi combinado' : details?.items ?? 'Serviço ou produto'} />
            {contract ? <>
              <Field label={`Valor unitário (${currency}) · opcional`} type="number" min="0" value={item.unitPrice}
                onChange={change('unitPrice')} validate={amountError} />
              <details className="quantity-details">
                <summary>Quantidade e unidade</summary>
                <div className="field-row">{quantityFields}</div>
              </details>
            </> : <div className={showPrices ? 'field-row item-row' : 'field-row'}>
              {quantityFields}
              {showPrices && <Field label={`Valor (${currency})`} type="number" min="0" value={item.unitPrice} onChange={change('unitPrice')} validate={amountError} />}
            </div>}
            {showPrices && (!contract || item.unitPrice !== '') && <div className="item-total">Subtotal <strong>{money(itemTotal(item), currency)}</strong></div>}
          </fieldset>
        )
      })}
      <button className="button" id={addButtonId}
        onClick={() => update(current => [...current, newItem(crypto.randomUUID())])}><Plus size={16} aria-hidden="true" /> Adicionar {entryName.toLowerCase()}</button>
      {showPrices && (!contract || items.some(item => item.unitPrice !== '')) && <div className="grand-total">
        <span>{contract ? 'Total do contrato' : details?.total ?? 'Total do documento'}</span><strong>{money(subtotal, currency)}</strong>
      </div>}
    </>
  )
}

function ClauseFields({ receipt, update }) {
  const addButtonId = useId()
  const [addedId, setAddedId] = useState(null)
  const clauses = receipt.clauses ?? []
  const changeClauses = transform => update(current => ({ ...current, clauses: transform(current.clauses ?? []) }))

  return (
    <>
      {clauses.map((clause, index) => {
        const change = field => value => changeClauses(current => current.map(row => row.id === clause.id ? { ...row, [field]: value } : row))
        return (
          <fieldset className="item-fields" key={clause.id}>
            <legend>Cláusula {index + 1}</legend>
            <button type="button" className="icon-button remove-item" aria-label={`Remover cláusula ${index + 1}`}
              onClick={() => {
                changeClauses(current => current.filter(row => row.id !== clause.id))
                document.getElementById(addButtonId)?.focus()
              }}><Trash2 size={17} aria-hidden="true" /></button>
            <Field label="Título" value={clause.title} onChange={change('title')} autoFocus={addedId === clause.id}
              placeholder="Ex.: Prazos de entrega" />
            <Field label="Texto da cláusula" type="textarea" value={clause.text} onChange={change('text')} />
          </fieldset>
        )
      })}
      <button type="button" className="button" id={addButtonId} onClick={() => {
        const id = crypto.randomUUID()
        setAddedId(id)
        changeClauses(current => [...current, { id, title: '', text: '' }])
      }}><Plus size={16} aria-hidden="true" /> Adicionar cláusula</button>
      <Field label="Condições gerais" type="textarea" value={receipt.notes}
        onChange={notes => update(current => ({ ...current, notes }))}
        placeholder="Informações adicionais acordadas entre as partes" />
    </>
  )
}

export default function FormSection({ activeTab, draft, update, subtotal, contract }) {
  const change = section => field => value => update(section, current => ({ ...current, [field]: value }))
  const details = documentDetails[draft.receipt.type]
  return (
    <div className="form-fields" key={activeTab}>
      {activeTab === 'empresa' && <PartyFields party={draft.company} change={change('company')} company contextual={Boolean(details)} />}
      {activeTab === 'cliente' && <PartyFields party={draft.client} change={change('client')} />}
      {activeTab === 'documento' && <DocumentFields receipt={draft.receipt} change={change('receipt')} details={details} />}
      {activeTab === 'itens' && (contract ? (
        <>
          <section className="contract-fields" aria-label="Escopo">
            <h3>{details?.items ?? 'Escopo do contrato'}</h3>
            <ItemsFields items={draft.items} currency={draft.receipt.currency} subtotal={subtotal} details={details} contract
              update={next => update('items', next)} />
          </section>
          <section className="contract-fields" aria-label="Cláusulas e condições">
            <h3>Cláusulas e condições</h3>
            <ClauseFields receipt={draft.receipt} update={next => update('receipt', next)} />
          </section>
        </>
      ) : <ItemsFields items={draft.items} currency={draft.receipt.currency} subtotal={subtotal} details={details}
        update={next => update('items', next)} />)}
    </div>
  )
}
