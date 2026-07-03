import { Dices } from 'lucide-react'
import { Link } from 'react-router'

export function BrandMark() {
  return (
    <Link to="/campaigns" className="flex items-center gap-[11px]">
      <span className="grid size-[34px] place-items-center text-accent drop-shadow-[0_0_10px_var(--accent-glow)]">
        <Dices className="size-full" strokeWidth={1.4} />
      </span>
      <span className="font-display text-[19px] font-bold tracking-[0.04em] text-fg">
        Dice<b className="font-bold text-accent">Fight</b>
      </span>
    </Link>
  )
}
