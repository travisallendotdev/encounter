import type { ReactNode } from 'react'

export function Field({
  label,
  htmlFor,
  error,
  className = '',
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`flex flex-col gap-[7px] ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-muted"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-[12.5px] text-monster">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-el border border-line bg-bg-2 px-3.5 py-3 text-[15px] text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent-glow transition'

export const inputNumClass = `${inputClass} text-center font-mono font-bold tabular-nums`
