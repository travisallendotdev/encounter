import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Dices, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { inputClass } from '../../components/Field'
import { Panel } from '../../components/Panel'
import { TopBar } from '../../components/TopBar'
import { useCampaigns, useCreateCampaign } from './queries'

const newCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})
type NewCampaignForm = z.infer<typeof newCampaignSchema>

function NewCampaignTile() {
  const createCampaign = useCreateCampaign()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewCampaignForm>({ resolver: zodResolver(newCampaignSchema) })

  return (
    <form
      className="flex min-h-[168px] flex-col justify-center gap-3 rounded-card border border-dashed border-line-2 bg-transparent p-[22px] transition hover:border-accent"
      onSubmit={handleSubmit((form) =>
        createCampaign.mutate(form.name, { onSuccess: () => reset() }),
      )}
    >
      <div className="flex items-center gap-[9px] font-display text-base font-semibold tracking-[0.02em] text-accent">
        <Plus className="size-[1.2em]" />
        New campaign
      </div>
      <div className="flex flex-col gap-[7px]">
        <input
          type="text"
          placeholder="Name your world…"
          autoComplete="off"
          className={`${inputClass} px-3 py-2.5 text-sm`}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-[12.5px] text-monster">{errors.name.message}</p>
        )}
        {createCampaign.isError && (
          <p className="text-[12.5px] text-monster">
            {createCampaign.error.message}
          </p>
        )}
      </div>
      <Button
        variant="primary"
        type="submit"
        disabled={createCampaign.isPending}
      >
        Forge it
      </Button>
    </form>
  )
}

export function CampaignsPage() {
  const campaigns = useCampaigns()

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] pt-[clamp(26px,5vw,52px)] pb-20">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Your table
            </div>
            <h1 className="font-display text-[clamp(28px,4.4vw,44px)] leading-[1.05] font-semibold tracking-[0.01em] text-fg">
              Campaigns
            </h1>
            <p className="mt-2 max-w-[56ch] text-[15px] text-muted">
              Pick up the thread, or start something new.
            </p>
          </div>
        </div>

        {campaigns.isPending && (
          <p className="text-muted">Summoning your campaigns…</p>
        )}
        {campaigns.isError && (
          <Panel title="Something went wrong">
            <p className="mb-4 text-sm text-muted">{campaigns.error.message}</p>
            <Button onClick={() => campaigns.refetch()}>Try again</Button>
          </Panel>
        )}

        {campaigns.isSuccess && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px]">
            {campaigns.data.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="group relative flex min-h-[168px] flex-col overflow-hidden rounded-card border border-line bg-surface p-[22px] pb-[18px] transition hover:-translate-y-[3px] hover:border-accent-deep hover:shadow-panel"
              >
                <span className="absolute top-[18px] right-[18px] text-faint transition group-hover:translate-x-0.5 group-hover:text-accent">
                  <ArrowRight className="size-[1.2em]" />
                </span>
                <div className="relative z-[1] pr-8 font-display text-[21px] leading-[1.18] font-semibold tracking-[0.01em]">
                  {campaign.name}
                </div>
                <div className="relative z-[1] mt-auto flex gap-4 pt-4 text-[12.5px] text-muted">
                  <span>
                    forged{' '}
                    <b className="font-mono font-bold text-fg">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </b>
                  </span>
                </div>
                <span className="pointer-events-none absolute -right-[22px] -bottom-[22px] size-[120px] text-line opacity-50">
                  <Dices className="size-full" strokeWidth={0.9} />
                </span>
              </Link>
            ))}
            <NewCampaignTile />
          </div>
        )}
      </main>
    </>
  )
}
