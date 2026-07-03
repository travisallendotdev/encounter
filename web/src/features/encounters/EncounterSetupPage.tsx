import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, Skull, Users, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import type { EncounterDetail, Pc } from '../../api/schemas'
import { Button } from '../../components/Button'
import { Field, inputClass, inputNumClass } from '../../components/Field'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { TopBar } from '../../components/TopBar'
import { usePcs } from '../campaigns/pcQueries'
import { useCampaign } from '../campaigns/queries'
import {
  useAddMonsters,
  useRemoveEncounterPc,
  useRemoveMonster,
  useSetEncounterPcs,
} from './mutations'
import { useEncounter } from './queries'

const addMonsterSchema = z.object({
  name: z.string().trim().min(1, 'Monster name is required'),
  quantity: z.coerce.number<number>().int().min(1),
  initiativeModifier: z.coerce.number<number>().int(),
})
type AddMonsterForm = z.infer<typeof addMonsterSchema>

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

function MonsterPanel({ encounter }: { encounter: EncounterDetail }) {
  const addMonsters = useAddMonsters(encounter.id)
  const removeMonster = useRemoveMonster(encounter.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMonsterForm>({
    resolver: zodResolver(addMonsterSchema),
    defaultValues: { quantity: 1, initiativeModifier: 0 },
  })

  return (
    <Panel
      icon={<Skull className="size-[1.2em] text-monster" />}
      title="Monsters"
      count={encounter.monsters.length}
    >
      {encounter.monsters.length === 0 && (
        <p className="text-sm text-muted">
          No monsters staged. Summon some below.
        </p>
      )}
      <div className="flex flex-col gap-[9px]">
        {encounter.monsters.map((monster) => (
          <div
            key={monster.id}
            className="relative flex items-center gap-3.5 rounded-el border border-line bg-surface-2 py-[13px] pr-2.5 pl-[15px]"
          >
            <span className="-ml-1 mr-0.5 -my-0.5 w-1 self-stretch rounded bg-monster" />
            <span className="grid size-[38px] flex-none place-items-center rounded-[9px] border border-line-2 bg-monster-soft text-monster">
              <Skull className="size-[1.3em]" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15.5px] font-semibold">
                {monster.encounterInstanceName}
              </div>
            </div>
            <span className="rounded-[7px] border border-line bg-bg-2 px-[9px] py-[3px] font-mono text-[12.5px] font-bold text-muted">
              init{' '}
              <span className="text-accent">
                {signed(monster.initiativeModifier)}
              </span>
            </span>
            <Button
              variant="icon"
              aria-label={`Remove ${monster.encounterInstanceName}`}
              onClick={() => removeMonster.mutate(monster.id)}
              disabled={removeMonster.isPending}
            >
              <X className="size-[1.2em]" />
            </Button>
          </div>
        ))}
      </div>
      <form
        className="mt-3.5 flex flex-wrap items-end gap-2.5 border-t border-dashed border-line-2 pt-4"
        onSubmit={handleSubmit((form) =>
          addMonsters.mutate(form, {
            onSuccess: () =>
              reset({ name: '', quantity: 1, initiativeModifier: 0 }),
          }),
        )}
      >
        <Field
          label="Monster"
          htmlFor="mon-name"
          error={errors.name?.message}
          className="flex-1 basis-40"
        >
          <input
            id="mon-name"
            className={inputClass}
            placeholder="e.g. Goblin"
            autoComplete="off"
            {...register('name')}
          />
        </Field>
        <Field
          label="Qty"
          htmlFor="mon-qty"
          error={errors.quantity?.message}
          className="w-[84px] flex-none"
        >
          <input
            id="mon-qty"
            type="number"
            min={1}
            className={inputNumClass}
            {...register('quantity')}
          />
        </Field>
        <Field
          label="Init mod"
          htmlFor="mon-mod"
          error={errors.initiativeModifier?.message}
          className="w-[110px] flex-none"
        >
          <input
            id="mon-mod"
            type="number"
            className={inputNumClass}
            {...register('initiativeModifier')}
          />
        </Field>
        <Button
          variant="primary"
          type="submit"
          disabled={addMonsters.isPending}
        >
          Add
        </Button>
        {addMonsters.isError && (
          <p className="basis-full text-[12.5px] text-monster">
            {addMonsters.error.message}
          </p>
        )}
      </form>
    </Panel>
  )
}

function PartyPanel({
  encounter,
  roster,
}: {
  encounter: EncounterDetail
  roster: Pc[]
}) {
  const addPc = useSetEncounterPcs(encounter.id)
  const removePc = useRemoveEncounterPc(encounter.id)
  const stagedIds = new Set(encounter.pcs.map((pc) => pc.id))

  return (
    <Panel
      icon={<Users className="size-[1.2em] text-pc" />}
      title="Party"
      count={`${encounter.pcs.length} of ${roster.length}`}
    >
      <p className="-mt-1 mb-3.5 text-[13px] text-muted">
        Toggle which heroes are present for this fight.
      </p>
      {roster.length === 0 && (
        <p className="text-sm text-muted">
          This campaign has no PCs yet — add them on the campaign page.
        </p>
      )}
      <div className="flex flex-col gap-[9px]">
        {roster.map((pc) => {
          const on = stagedIds.has(pc.id)
          return (
            <div
              key={pc.id}
              className={`flex items-center gap-[13px] rounded-el border px-3.5 py-3 ${
                on
                  ? 'border-pc bg-pc-soft'
                  : 'border-line bg-surface-2 opacity-60'
              }`}
            >
              <span
                className={`grid size-6 flex-none place-items-center rounded-[7px] border-[1.5px] transition ${
                  on
                    ? 'border-pc bg-pc text-bg'
                    : 'border-line-2 text-transparent'
                }`}
              >
                <Check className="size-4" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15.5px] font-semibold">{pc.name}</div>
                <div className="mt-px text-[13px] text-muted">
                  played by {pc.playerName}
                </div>
              </div>
              <button
                type="button"
                className={`cursor-pointer rounded-[7px] border bg-transparent px-3 py-1.5 text-xs font-bold tracking-[0.04em] ${
                  on ? 'border-line text-monster' : 'border-pc text-pc'
                }`}
                aria-label={
                  on
                    ? `Remove ${pc.name} from party`
                    : `Add ${pc.name} to party`
                }
                onClick={() =>
                  on ? removePc.mutate(pc.id) : addPc.mutate([pc.id])
                }
                disabled={addPc.isPending || removePc.isPending}
              >
                {on ? 'Remove' : 'Add to party'}
              </button>
            </div>
          )
        })}
      </div>
      {(addPc.isError || removePc.isError) && (
        <p className="mt-3 text-[12.5px] text-monster">
          {addPc.error?.message ?? removePc.error?.message}
        </p>
      )}
    </Panel>
  )
}

export function EncounterSetupPage() {
  const { id, eid } = useParams()
  const campaignId = id ?? ''
  const encounterId = eid ?? ''
  const navigate = useNavigate()
  const campaign = useCampaign(campaignId)
  const encounter = useEncounter(encounterId)
  const roster = usePcs(campaignId)

  useEffect(() => {
    if (encounter.data?.status === 'active') {
      navigate(`/encounters/${encounterId}/combat`, { replace: true })
    }
  }, [encounter.data?.status, encounterId, navigate])

  const ready =
    (encounter.data?.monsters.length ?? 0) >= 1 &&
    (encounter.data?.pcs.length ?? 0) >= 1

  return (
    <>
      <TopBar
        crumbs={[
          { label: campaign.data?.name ?? '…', to: `/campaigns/${campaignId}` },
          { label: encounter.data?.name ?? '…' },
        ]}
      />
      <main className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] pt-[clamp(26px,5vw,52px)] pb-20">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Encounter #{encounter.data?.encounterNumber ?? '…'} ·{' '}
              <span className="text-muted">Draft</span>
            </div>
            <h1 className="font-display text-[clamp(28px,4.4vw,44px)] leading-[1.05] font-semibold tracking-[0.01em] text-fg">
              {encounter.data?.name ?? '…'}
            </h1>
            <p className="mt-2 max-w-[56ch] text-[15px] text-muted">
              Stage the monsters and the party before you roll. Nothing is
              locked until combat begins.
            </p>
          </div>
          <Pill kind="draft" className="px-3.5 py-[7px] text-xs" />
        </div>

        {encounter.isError && (
          <Panel title="Encounter not found">
            <p className="text-sm text-muted">{encounter.error.message}</p>
          </Panel>
        )}

        {encounter.isSuccess && (
          <>
            <div className="grid grid-cols-1 gap-[22px] min-[761px]:grid-cols-2">
              <MonsterPanel encounter={encounter.data} />
              <PartyPanel
                encounter={encounter.data}
                roster={roster.data ?? []}
              />
            </div>

            <div className="mt-[26px] flex flex-wrap items-center justify-between gap-[18px] rounded-card border border-line-2 bg-linear-to-b from-surface to-bg-2 px-6 py-5">
              <div className="text-sm text-muted">
                <b className="font-mono text-fg">
                  {encounter.data.monsters.length}
                </b>{' '}
                monsters and{' '}
                <b className="font-mono text-fg">{encounter.data.pcs.length}</b>{' '}
                heroes staged.{' '}
                {ready
                  ? 'Ready when you are.'
                  : 'You need at least one monster and one hero.'}
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={!ready}
                onClick={() =>
                  navigate(`/encounters/${encounterId}/initiative`)
                }
              >
                Start encounter
                <ArrowRight className="size-[1.2em]" />
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  )
}
