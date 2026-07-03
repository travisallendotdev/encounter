import { ArrowRight, Shield, Skull } from 'lucide-react'
import { useEffect, useReducer } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { TurnEntry } from '../../api/schemas'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { TopBar } from '../../components/TopBar'
import { useEncounter } from '../encounters/queries'
import { combatReducer } from './combatReducer'
import { type CombatState, loadCombat, saveCombat } from './combatStorage'

function FaceIcon({ type }: { type: TurnEntry['participantType'] }) {
  return type === 'pc' ? (
    <span className="grid size-10 flex-none place-items-center rounded-[10px] border border-line-2 bg-pc-soft text-pc">
      <Shield className="size-5" strokeWidth={1.6} />
    </span>
  ) : (
    <span className="grid size-10 flex-none place-items-center rounded-[10px] border border-line-2 bg-monster-soft text-monster">
      <Skull className="size-5" strokeWidth={1.6} />
    </span>
  )
}

function CombatTracker({ initial }: { initial: CombatState }) {
  const [state, dispatch] = useReducer(combatReducer, initial)

  useEffect(() => {
    saveCombat(state)
  }, [state])

  const current = state.turnOrder[state.turnIndex]
  const onDeck = state.turnOrder[(state.turnIndex + 1) % state.turnOrder.length]

  return (
    <main className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] pt-[clamp(20px,3.5vw,36px)] pb-16">
      {/* combat header band */}
      <div className="mb-6 flex flex-wrap items-center gap-[22px]">
        <div className="min-w-0">
          <Pill kind="active" className="mb-2" />
          <h1 className="font-display text-[clamp(24px,3.4vw,34px)] leading-[1.05] font-semibold tracking-[0.01em]">
            {state.encounterName}
          </h1>
          <div className="mt-1 text-sm text-muted">
            {state.turnOrder.length} combatants in the order · highest
            initiative acts first
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3.5 rounded-xl border border-line-2 bg-surface px-[18px] py-2.5">
          <div className="text-center">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Round
            </div>
            <div
              role="status"
              className="font-mono text-[22px] font-bold tabular-nums text-accent-strong"
              aria-label={`Round ${state.round}`}
            >
              {state.round}
            </div>
          </div>
          <div className="w-px self-stretch bg-line-2" />
          <div className="text-center">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
              Turn
            </div>
            <div className="font-mono text-[22px] font-bold tabular-nums text-accent-strong">
              {state.turnIndex + 1}
              <span className="text-[15px] text-faint">
                /{state.turnOrder.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* now playing hero band */}
      <div className="mb-3.5 flex flex-wrap items-center gap-[22px] rounded-[18px] border border-accent-deep bg-surface p-[22px_26px] shadow-panel [background-image:radial-gradient(120%_160%_at_0%_0%,var(--accent-glow),transparent_60%)]">
        <div className="grid size-[104px] flex-none place-items-center rounded-[20px] bg-linear-160 from-accent-strong to-accent-deep font-mono text-[52px] font-bold tabular-nums text-on-accent shadow-[0_10px_30px_var(--accent-glow)]">
          {current.initiative}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-accent">
            Now acting
          </span>
          <div className="mt-1.5 font-display text-[clamp(26px,4vw,40px)] leading-[1.04] font-semibold">
            {current.name}
          </div>
          <div className="mt-1.5 text-[14.5px] text-muted">
            {current.participantType === 'pc' ? 'Player character' : 'Monster'}
          </div>
        </div>
        <div className="flex-none max-[720px]:w-full">
          <Button
            variant="primary"
            size="lg"
            className="px-[30px] py-[18px] text-lg max-[720px]:w-full"
            onClick={() => dispatch({ type: 'NEXT_TURN' })}
          >
            Next turn
            <ArrowRight className="size-[1.2em]" strokeWidth={2.2} />
          </Button>
          <div className="mt-2 text-center text-[11.5px] tracking-[0.03em] text-faint">
            On deck · <b className="font-semibold text-muted">{onDeck.name}</b>
          </div>
        </div>
      </div>

      <div className="mx-0.5 mt-[26px] mb-3 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-muted">
        <span>Turn order</span>
        <span className="flex gap-4 max-[720px]:hidden">
          <span className="inline-flex items-center gap-1.5 text-[11px]">
            <span className="size-[9px] rounded-[3px] bg-pc" />
            Player
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px]">
            <span className="size-[9px] rounded-[3px] bg-monster" />
            Monster
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {state.turnOrder.map((entry, i) => {
          const isActive = i === state.turnIndex
          const isDone = i < state.turnIndex
          const marker = entry.participantType === 'pc' ? 'bg-pc' : 'bg-monster'
          return (
            <div
              key={entry.participantId}
              className={`flex items-center gap-[18px] rounded-xl border px-5 py-3.5 ${
                isActive
                  ? 'translate-x-0.5 border-accent bg-surface-3 shadow-[0_0_0_1px_var(--accent-glow),0_10px_28px_rgba(0,0,0,0.35)]'
                  : 'border-line bg-surface-2'
              } ${isDone ? 'opacity-40' : ''}`}
            >
              <span className="w-[22px] flex-none text-right font-mono text-xs text-faint">
                {i + 1}
              </span>
              <span
                className={`-my-0.5 w-[5px] flex-none self-stretch rounded-[5px] ${marker}`}
              />
              <FaceIcon type={entry.participantType} />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-lg font-semibold ${isActive ? 'text-accent-strong' : ''}`}
                >
                  {entry.name}
                  {isActive && (
                    <span className="ml-2 rounded-md bg-accent px-2 py-[3px] align-middle text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-accent">
                      Now
                    </span>
                  )}
                </div>
                <div className="mt-px text-[12.5px] text-muted">
                  {entry.participantType === 'pc'
                    ? 'Player character'
                    : 'Monster'}
                  {isDone ? ' · acted' : ''}
                </div>
              </div>
              <span
                className={`ml-auto font-mono font-bold tabular-nums ${
                  isActive
                    ? 'text-[34px] text-accent-strong'
                    : isDone
                      ? 'text-3xl text-faint'
                      : 'text-3xl text-fg'
                }`}
              >
                {entry.initiative}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}

function MissingCombatState({ encounterId }: { encounterId: string }) {
  const navigate = useNavigate()
  const encounter = useEncounter(encounterId)

  useEffect(() => {
    if (encounter.data?.status === 'draft') {
      navigate(
        `/campaigns/${encounter.data.campaignId}/encounters/${encounterId}/setup`,
        {
          replace: true,
        },
      )
    }
  }, [encounter.data, encounterId, navigate])

  return (
    <main className="mx-auto max-w-[720px] px-[clamp(16px,4vw,40px)] pt-[clamp(26px,5vw,52px)] pb-20">
      {encounter.isError ? (
        <Panel title="Encounter not found">
          <p className="text-sm text-muted">{encounter.error.message}</p>
        </Panel>
      ) : (
        <Panel title="Turn order unavailable">
          <p className="mb-4 text-sm text-muted">
            Turn order for this encounter isn't available in this browser — it
            lives only in the session that started combat.
          </p>
          {encounter.data && (
            <Link
              to={`/campaigns/${encounter.data.campaignId}`}
              className="text-accent hover:underline"
            >
              ← Back to {encounter.data.name}'s campaign
            </Link>
          )}
        </Panel>
      )}
    </main>
  )
}

export function CombatPage() {
  const { eid } = useParams()
  const encounterId = eid ?? ''
  const stored = loadCombat(encounterId)

  return (
    <>
      <TopBar
        crumbs={
          stored ? [{ label: stored.encounterName }, { label: 'Combat' }] : []
        }
      />
      {stored ? (
        <CombatTracker initial={stored} />
      ) : (
        <MissingCombatState encounterId={encounterId} />
      )}
    </>
  )
}
