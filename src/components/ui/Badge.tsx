import type { ReactNode } from 'react'

const TONES = {
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
  navy: 'bg-navy-50 text-navy-800 ring-navy-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
}

export type BadgeTone = keyof typeof TONES

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  )
}
