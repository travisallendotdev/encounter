import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'primary' | 'ghost' | 'icon'
type Size = 'md' | 'lg'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-el border font-semibold tracking-[0.01em] transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  default:
    'border-line-2 bg-surface-2 text-fg hover:border-accent-deep hover:bg-surface-3',
  primary:
    'border-accent-deep bg-linear-160 from-accent-strong to-accent-deep text-on-accent shadow-[0_8px_24px_var(--accent-glow)] hover:border-accent hover:brightness-107',
  ghost: 'border-line bg-transparent text-muted hover:bg-surface hover:text-fg',
  icon: 'grid size-9 place-items-center rounded-lg border-line bg-transparent p-0 text-muted hover:border-monster hover:bg-monster-soft hover:text-monster',
}

const sizes: Record<Size, string> = {
  md: 'px-[18px] py-[11px] text-[14.5px]',
  lg: 'rounded-[11px] px-[30px] py-4 text-[17px]',
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}) {
  const sizing = variant === 'icon' ? '' : sizes[size]
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizing} ${className}`}
      {...props}
    />
  )
}
