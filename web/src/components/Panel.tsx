import type { ReactNode } from 'react'

export function Panel({
  title,
  icon,
  count,
  actions,
  children,
  className = '',
}: {
  title?: ReactNode
  icon?: ReactNode
  count?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-card border border-line bg-surface p-[22px] ${className}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5 font-display text-[19px] font-semibold tracking-[0.02em]">
            {icon}
            {title}
            {count !== undefined && (
              <span className="rounded-full border border-line bg-surface-3 px-2.5 py-0.5 font-mono text-xs font-bold text-muted">
                {count}
              </span>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}
