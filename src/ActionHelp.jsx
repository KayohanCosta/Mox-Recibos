import { Info } from 'lucide-react'

export default function ActionHelp({ label, help, className = '', children }) {
  return (
    <div className={`action-help ${className}`}>
      {children}
      <details className="action-help-details" name="contract-action-help" onKeyDown={event => {
        if (event.key === 'Escape' && event.currentTarget.open) {
          event.preventDefault()
          event.currentTarget.open = false
        }
      }}>
        <summary aria-label={`Ajuda: ${label}`}>
          <Info size={17} aria-hidden="true" />
        </summary>
        <p className="action-help-text">{help}</p>
      </details>
    </div>
  )
}
