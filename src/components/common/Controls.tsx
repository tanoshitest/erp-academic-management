import { Check, Copy, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export function Toolbar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  )
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; count?: number }[]
}

export function Segmented<T extends string>({ value, onChange, options }: SegmentedProps<T>) {
  return (
    <div className="scrollbar-none -mx-1 flex max-w-full overflow-x-auto px-1">
      <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5" role="tablist">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            onClick={() => onChange(o.value)}
            className={`shrink-0 whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition ${
              value === o.value ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {o.label}
            {o.count != null && <span className={`ml-1.5 ${value === o.value ? 'text-navy-100' : 'text-slate-400'}`}>{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-500">{children}</p>
}

export function CopyButton({ text, label = 'Sao chép' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {done ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
      {done ? 'Đã chép' : label}
    </button>
  )
}
