export function Pill({
  kind,
  className = '',
}: {
  kind: 'draft' | 'active'
  className?: string
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em]'
  if (kind === 'active') {
    return (
      <span className={`${base} border-ok/30 bg-ok/12 text-ok ${className}`}>
        <span className="size-1.5 rounded-full bg-ok shadow-[0_0_8px_var(--ok)]" />
        Active
      </span>
    )
  }
  return (
    <span
      className={`${base} border-line-2 bg-surface-3 text-muted ${className}`}
    >
      Draft
    </span>
  )
}
