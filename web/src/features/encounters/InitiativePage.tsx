import { Dices, Skull, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { EncounterDetail } from '../../api/schemas'
import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { TopBar } from '../../components/TopBar'
import { useCampaign } from '../campaigns/queries'
import { saveCombat } from '../combat/combatStorage'
import { rollD20 } from '../combat/dice'
import { useStartEncounter } from './mutations'
import { useEncounter } from './queries'

const initInputClass =
  'h-[52px] w-[72px] rounded-[10px] border border-line-2 bg-bg-2 text-center font-mono text-2xl font-bold tabular-nums text-fg transition focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent-glow'

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

function InitiativeForm({ encounter }: { encounter: EncounterDetail }) {
  const navigate = useNavigate()
  const startEncounter = useStartEncounter(encounter.id)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const seeded: Record<string, string> = {}
    for (const monster of encounter.monsters) {
      seeded[monster.id] = String(rollD20() + monster.initiativeModifier)
    }
    return seeded
  })

  const setValue = (id: string, value: string) => setValues((prev) => ({ ...prev, [id]: value }))

  const rerollMonsters = () =>
    setValues((prev) => {
      const next = { ...prev }
      for (const monster of encounter.monsters) {
        next[monster.id] = String(rollD20() + monster.initiativeModifier)
      }
      return next
    })

  const participants = [...encounter.pcs, ...encounter.monsters]
  const filledCount = participants.filter((p) => values[p.id]?.trim() !== '' && values[p.id] !== undefined).length
  const allFilled = filledCount === participants.length
  const pendingNames = encounter.pcs
    .filter((pc) => !values[pc.id]?.trim())
    .map((pc) => pc.name)

  const begin = () => {
    const initiatives: Record<string, number> = {}
    for (const p of participants) initiatives[p.id] = Number(values[p.id])
    startEncounter.mutate(
      { monsterInitiatives: 'manual', initiatives },
      {
        onSuccess: (result) => {
          saveCombat({
            encounterId: encounter.id,
            encounterName: encounter.name,
            turnOrder: result.turnOrder,
            round: 1,
            turnIndex: 0,
          })
          navigate(`/encounters/${encounter.id}/combat`)
        },
      },
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-[22px] min-[761px]:grid-cols-2">
        <Panel
          icon={<Users className="size-[1.2em] text-pc" />}
          title="The Party"
          count={encounter.pcs.length}
        >
          <p className="-mt-1 mb-4 text-[12.5px] text-muted">Enter the number each player rolled.</p>
          <div className="flex flex-col gap-[9px]">
            {encounter.pcs.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center gap-3.5 rounded-el border border-line bg-surface-2 py-[11px] pr-3 pl-[15px]"
              >
                <span className="-my-px w-1 self-stretch rounded bg-pc" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15.5px] font-semibold">{pc.name}</div>
                  <div className="mt-px text-[13px] text-muted">played by {pc.playerName}</div>
                </div>
                <input
                  type="number"
                  className={`${initInputClass} ${values[pc.id]?.trim() ? 'border-pc text-accent-strong' : ''}`}
                  placeholder="—"
                  aria-label={`${pc.name} initiative`}
                  value={values[pc.id] ?? ''}
                  onChange={(e) => setValue(pc.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          icon={<Skull className="size-[1.2em] text-monster" />}
          title="Monsters"
          count={encounter.monsters.length}
          actions={
            <Button className="px-3.5 py-2 text-[13px]" onClick={rerollMonsters}>
              <Dices className="size-[1.2em]" />
              Roll for monsters
            </Button>
          }
        >
          <p className="-mt-1 mb-4 text-[12.5px] text-muted">
            Auto-rolled (d20 + init mod). Edit any number to override.
          </p>
          <div className="flex flex-col gap-[9px]">
            {encounter.monsters.map((monster) => (
              <div
                key={monster.id}
                className="flex items-center gap-3.5 rounded-el border border-line bg-surface-2 py-[11px] pr-3 pl-[15px]"
              >
                <span className="-my-px w-1 self-stretch rounded bg-monster" />
                <div className="min-w-0 flex-1">
                  <div className="text-[15.5px] font-semibold">{monster.encounterInstanceName}</div>
                  <div className="mt-px text-[13px] text-muted">{signed(monster.initiativeModifier)} init</div>
                </div>
                <input
                  type="number"
                  className={`${initInputClass} border-monster text-accent-strong`}
                  aria-label={`${monster.encounterInstanceName} initiative`}
                  value={values[monster.id] ?? ''}
                  onChange={(e) => setValue(monster.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-[26px] flex flex-wrap items-center justify-between gap-[18px] rounded-card border border-line-2 bg-linear-to-b from-surface to-bg-2 px-6 py-5">
        <div className="text-sm text-muted">
          <b className="font-mono text-fg">
            {filledCount} of {participants.length}
          </b>{' '}
          initiatives set
          {pendingNames.length > 0 && ` · ${pendingNames.join(', ')} still pending`}
        </div>
        <div className="flex flex-col items-stretch gap-2">
          <Button variant="primary" size="lg" disabled={!allFilled || startEncounter.isPending} onClick={begin}>
            Begin combat
            <Zap className="size-[1.2em]" />
          </Button>
          {startEncounter.isError && (
            <p className="text-[12.5px] text-monster">{startEncounter.error.message}</p>
          )}
        </div>
      </div>
    </>
  )
}

export function InitiativePage() {
  const { eid } = useParams()
  const encounterId = eid ?? ''
  const navigate = useNavigate()
  const encounter = useEncounter(encounterId)
  const campaign = useCampaign(encounter.data?.campaignId ?? '')

  useEffect(() => {
    if (encounter.data?.status === 'active') {
      navigate(`/encounters/${encounterId}/combat`, { replace: true })
    }
  }, [encounter.data?.status, encounterId, navigate])

  return (
    <>
      <TopBar
        crumbs={[
          {
            label: campaign.data?.name ?? '…',
            to: encounter.data ? `/campaigns/${encounter.data.campaignId}` : undefined,
          },
          {
            label: encounter.data?.name ?? '…',
            to: encounter.data
              ? `/campaigns/${encounter.data.campaignId}/encounters/${encounterId}/setup`
              : undefined,
          },
          { label: 'Initiative' },
        ]}
      />
      <main className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] pt-[clamp(26px,5vw,52px)] pb-20">
        <div className="mb-[30px]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {encounter.data?.name ?? '…'} · go around the table
          </div>
          <h1 className="font-display text-[clamp(28px,4.4vw,44px)] leading-[1.05] font-semibold tracking-[0.01em] text-fg">
            Roll for Initiative
          </h1>
          <p className="mt-2 max-w-[56ch] text-[15px] text-muted">
            Ask each player what they rolled and key it in. The app pre-rolls the monsters — override any
            number you like.
          </p>
        </div>

        {encounter.isError && (
          <Panel title="Encounter not found">
            <p className="text-sm text-muted">{encounter.error.message}</p>
          </Panel>
        )}
        {encounter.isSuccess && encounter.data.status === 'draft' && (
          <InitiativeForm encounter={encounter.data} />
        )}
      </main>
    </>
  )
}
