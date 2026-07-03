import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Swords, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Field, inputClass } from '../../components/Field'
import { Panel } from '../../components/Panel'
import { Pill } from '../../components/Pill'
import { TopBar } from '../../components/TopBar'
import { useCreateEncounter, useEncounters } from '../encounters/queries'
import { useCreatePc, usePcs } from './pcQueries'
import { useCampaign } from './queries'

const newPcSchema = z.object({
  name: z.string().trim().min(1, 'Character name is required'),
  playerName: z.string().trim().min(1, 'Player name is required'),
})
type NewPcForm = z.infer<typeof newPcSchema>

const newEncounterSchema = z.object({ name: z.string().trim().min(1, 'Encounter name is required') })
type NewEncounterForm = z.infer<typeof newEncounterSchema>

function PcPanel({ campaignId }: { campaignId: string }) {
  const pcs = usePcs(campaignId)
  const createPc = useCreatePc(campaignId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPcForm>({ resolver: zodResolver(newPcSchema) })

  return (
    <Panel
      icon={<Users className="size-[1.2em] text-pc" />}
      title="Player Characters"
      count={pcs.data?.length ?? '…'}
    >
      {pcs.isPending && <p className="text-sm text-muted">Gathering the party…</p>}
      {pcs.isError && <p className="text-sm text-monster">{pcs.error.message}</p>}
      {pcs.isSuccess && pcs.data.length === 0 && (
        <p className="text-sm text-muted">No heroes yet. Add the party below.</p>
      )}
      {pcs.isSuccess && pcs.data.length > 0 && (
        <div className="flex flex-col gap-[9px]">
          {pcs.data.map((pc) => (
            <div
              key={pc.id}
              className="relative flex items-center gap-3.5 rounded-el border border-line bg-surface-2 px-[15px] py-[13px]"
            >
              <span className="-ml-1 mr-0.5 -my-0.5 w-1 self-stretch rounded bg-pc" />
              <span className="grid size-[38px] flex-none place-items-center rounded-[9px] border border-line-2 bg-pc-soft text-pc">
                <Shield className="size-[1.3em]" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15.5px] font-semibold">{pc.name}</div>
                <div className="mt-px text-[13px] text-muted">
                  <span className="text-faint">played by</span> {pc.playerName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <form
        className="mt-3.5 flex flex-wrap items-end gap-2.5 border-t border-dashed border-line-2 pt-4"
        onSubmit={handleSubmit((form) => createPc.mutate(form, { onSuccess: () => reset() }))}
      >
        <Field label="Character" htmlFor="pc-name" error={errors.name?.message} className="flex-1 basis-40">
          <input
            id="pc-name"
            className={inputClass}
            placeholder="Character name"
            autoComplete="off"
            {...register('name')}
          />
        </Field>
        <Field label="Player" htmlFor="pc-player" error={errors.playerName?.message} className="flex-1 basis-40">
          <input
            id="pc-player"
            className={inputClass}
            placeholder="Player name"
            autoComplete="off"
            {...register('playerName')}
          />
        </Field>
        <Button variant="primary" type="submit" disabled={createPc.isPending}>
          Add PC
        </Button>
        {createPc.isError && (
          <p className="basis-full text-[12.5px] text-monster">{createPc.error.message}</p>
        )}
      </form>
    </Panel>
  )
}

function EncounterPanel({ campaignId }: { campaignId: string }) {
  const navigate = useNavigate()
  const encounters = useEncounters(campaignId)
  const createEncounter = useCreateEncounter(campaignId)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewEncounterForm>({ resolver: zodResolver(newEncounterSchema) })

  return (
    <Panel
      icon={<Swords className="size-[1.2em] text-accent" />}
      title="Encounters"
      count={encounters.data?.length ?? '…'}
    >
      {encounters.isPending && <p className="text-sm text-muted">Consulting the ledger…</p>}
      {encounters.isError && <p className="text-sm text-monster">{encounters.error.message}</p>}
      {encounters.isSuccess && encounters.data.length === 0 && (
        <p className="text-sm text-muted">Nothing staged yet. Create the first encounter below.</p>
      )}
      {encounters.isSuccess && encounters.data.length > 0 && (
        <div className="flex flex-col gap-[9px]">
          {encounters.data.map((encounter) => (
            <Link
              key={encounter.id}
              to={
                encounter.status === 'active'
                  ? `/encounters/${encounter.id}/combat`
                  : `/campaigns/${campaignId}/encounters/${encounter.id}/setup`
              }
              className="flex items-center gap-3.5 rounded-el border border-line bg-surface-2 px-[15px] py-[13px] transition hover:border-accent-deep hover:bg-surface-3"
            >
              <span className="grid size-11 flex-none place-items-center rounded-[9px] border border-line-2 bg-bg-2 text-center font-mono text-[13px] font-bold text-accent">
                #{encounter.encounterNumber}
                <small className="block text-[8.5px] tracking-[0.1em] text-faint">ENC</small>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15.5px] font-semibold">{encounter.name}</div>
                <div className="mt-px text-[13px] text-muted">
                  {encounter.status === 'active' ? 'Combat underway' : 'Drafting'}
                </div>
              </div>
              <Pill kind={encounter.status} />
            </Link>
          ))}
        </div>
      )}
      <form
        className="mt-3.5 flex flex-wrap items-end gap-2.5 border-t border-dashed border-line-2 pt-4"
        onSubmit={handleSubmit((form) =>
          createEncounter.mutate(form.name, {
            onSuccess: (encounter) =>
              navigate(`/campaigns/${campaignId}/encounters/${encounter.id}/setup`),
          }),
        )}
      >
        <Field label="New encounter" htmlFor="enc-name" error={errors.name?.message} className="w-full">
          <input
            id="enc-name"
            className={inputClass}
            placeholder="e.g. Ambush at the Bridge"
            autoComplete="off"
            {...register('name')}
          />
        </Field>
        <Button variant="primary" type="submit" disabled={createEncounter.isPending}>
          Create encounter
        </Button>
        {createEncounter.isError && (
          <p className="basis-full text-[12.5px] text-monster">{createEncounter.error.message}</p>
        )}
      </form>
    </Panel>
  )
}

export function CampaignDetailPage() {
  const { id } = useParams()
  const campaignId = id ?? ''
  const campaign = useCampaign(campaignId)

  return (
    <>
      <TopBar crumbs={[{ label: campaign.data?.name ?? '…' }]} />
      <main className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] pt-[clamp(26px,5vw,52px)] pb-20">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Campaign</div>
            <h1 className="font-display text-[clamp(28px,4.4vw,44px)] leading-[1.05] font-semibold tracking-[0.01em] text-fg">
              {campaign.data?.name ?? '…'}
            </h1>
          </div>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 rounded-el border border-line bg-transparent px-[18px] py-[11px] text-[14.5px] font-semibold text-muted transition hover:bg-surface hover:text-fg"
          >
            ← All campaigns
          </Link>
        </div>

        {campaign.isError && (
          <Panel title="Campaign not found">
            <p className="text-sm text-muted">{campaign.error.message}</p>
          </Panel>
        )}

        {!campaign.isError && (
          <div className="grid grid-cols-1 gap-[22px] min-[761px]:grid-cols-2">
            <PcPanel campaignId={campaignId} />
            <EncounterPanel campaignId={campaignId} />
          </div>
        )}
      </main>
    </>
  )
}
