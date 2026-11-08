import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const ACCENTS = {
  navy: 'bg-navy-50 text-navy-800',
  blue: 'bg-blue-50 text-blue-700',
  teal: 'bg-teal-50 text-teal-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  green: 'bg-emerald-50 text-emerald-700',
}

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon: LucideIcon
  accent?: keyof typeof ACCENTS
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'navy' }: StatCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${ACCENTS[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 whitespace-nowrap text-xl font-semibold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}
