import { useEffect, useRef, useState } from 'react'
import { createStore, get, set } from 'idb-keyval'
import { newItem } from './templates.js'

const storageKey = 'draft:v1'
const draftStore = createStore('easy-recibos', 'documents')

function initialDraft() {
  return {
    company: { name: '', cnpj: '', address: '', phone: '', email: '', logoPreview: null },
    client: { name: '', cpfCnpj: '', address: '', phone: '', email: '' },
    receipt: {
      number: `REC-${Date.now().toString().slice(-6)}`,
      type: 'recibo',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentMethod: 'pix',
      notes: '',
      currency: 'BRL',
    },
    items: [newItem(1)],
  }
}

export default function useDraft() {
  const [draft, setDraft] = useState(initialDraft)
  const [status, setStatus] = useState('loading')
  const latest = useRef(draft)
  const revision = useRef(0)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      try {
        const stored = await get(storageKey, draftStore)
        if (cancelled) return
        if (stored?.company && stored.client && stored.receipt && Array.isArray(stored.items) && stored.items.length) {
          latest.current = stored
          setDraft(stored)
          setStatus('saved')
        } else {
          setStatus('new')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    restore()
    return () => { cancelled = true }
  }, [])

  async function update(section, next) {
    const current = latest.current
    const value = typeof next === 'function' ? next(current[section]) : next
    const updated = { ...current, [section]: value }
    const version = ++revision.current
    latest.current = updated
    setDraft(updated)
    setStatus('saving')
    try {
      await set(storageKey, updated, draftStore)
      if (version === revision.current) setStatus('saved')
    } catch {
      if (version === revision.current) setStatus('error')
    }
  }

  return { draft, status, update }
}
