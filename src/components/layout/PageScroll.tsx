import type { ReactNode } from 'react'

export function PageScroll({ top, children }: { top: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 px-4 pb-4 pt-4 lg:px-6 lg:pt-6">{top}</div>
      <div data-testid="list-scroll" className="flex min-h-0 flex-1 flex-col gap-5 px-4 pb-4 lg:px-6 lg:pb-6">
        {children}
      </div>
    </div>
  )
}
