import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, Palette } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'
import { getUsername } from '../features/auth/session'
import { type ThemeName, useTheme } from '../theme/ThemeProvider'
import { BrandMark } from './BrandMark'

export type Crumb = { label: string; to?: string }

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'candlelight', label: 'Candlelight' },
  { value: 'arcane-slate', label: 'Arcane Slate' },
]

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Switch theme"
          className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line bg-transparent text-muted transition hover:border-accent-deep hover:text-fg"
        >
          <Palette className="size-[18px]" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-44 rounded-el border border-line-2 bg-surface-2 p-1.5 shadow-panel"
        >
          {THEMES.map((t) => (
            <DropdownMenu.Item
              key={t.value}
              onSelect={() => setTheme(t.value)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-[13.5px] text-fg outline-none data-highlighted:bg-surface-3"
            >
              {t.label}
              {theme === t.value && <Check className="size-4 text-accent" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function TopBar({ crumbs = [] }: { crumbs?: Crumb[] }) {
  const username = getUsername() ?? ''
  return (
    <header className="sticky top-0 z-40 flex items-center gap-[18px] border-b border-line bg-bg/85 px-[clamp(16px,4vw,40px)] py-3.5 backdrop-blur-[10px]">
      <BrandMark />
      {crumbs.length > 0 && (
        <nav className="hidden min-w-0 flex-wrap items-center gap-[9px] text-[13.5px] text-muted sm:flex">
          <Link to="/campaigns" className="hover:text-fg">
            Campaigns
          </Link>
          {crumbs.map((crumb) => (
            <Fragment key={`${crumb.to ?? ''}/${crumb.label}`}>
              <span className="text-faint">/</span>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-fg">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-fg">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex-1" />
      <ThemeSwitcher />
      {username && (
        <div className="flex items-center gap-[9px] rounded-full border border-line bg-surface py-1.5 pr-[13px] pl-[7px] text-[13.5px] text-muted">
          <span className="grid size-[26px] place-items-center rounded-full bg-linear-150 from-accent to-accent-deep font-display text-[13px] font-bold text-on-accent">
            {username.charAt(0).toUpperCase()}
          </span>
          {username}
        </div>
      )}
    </header>
  )
}
