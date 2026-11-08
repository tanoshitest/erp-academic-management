import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white ${className}`}>{children}</section>
}

export function CardHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold text-navy-800">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}
