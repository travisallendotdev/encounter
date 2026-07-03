import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Dices } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { login } from '../../api/endpoints'
import { Button } from '../../components/Button'
import { inputClass } from '../../components/Field'
import { setUsername } from './session'

const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Name is required'),
})
type LoginForm = z.infer<typeof loginFormSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginFormSchema) })

  const loginMutation = useMutation({
    mutationFn: (form: LoginForm) => login(form.username),
    onSuccess: (dm) => {
      setUsername(dm.username)
      navigate('/campaigns')
    },
  })

  return (
    <div className="grid min-h-screen place-items-center p-7">
      <main className="relative z-[2] w-full max-w-[430px] text-center">
        <div className="mx-auto mb-[26px] size-[76px] animate-[floaty_6s_ease-in-out_infinite] text-accent drop-shadow-[0_0_22px_var(--accent-glow)]">
          <Dices className="size-full" strokeWidth={1.3} />
        </div>
        <h1 className="font-display text-[clamp(40px,9vw,58px)] leading-none font-bold tracking-[0.03em]">
          Dice<b className="font-bold text-accent">Fight</b>
        </h1>
        <p className="mt-3.5 text-[15.5px] tracking-[0.02em] text-muted">
          Gather the party.{' '}
          <span className="font-display italic text-fg">
            Roll for initiative.
          </span>
        </p>

        <form
          className="mt-[34px] rounded-card border border-line bg-surface p-6 text-left shadow-panel"
          onSubmit={handleSubmit((form) => loginMutation.mutate(form))}
        >
          <label
            className="mb-[9px] block text-[11.5px] font-semibold uppercase tracking-[0.13em] text-muted"
            htmlFor="dm"
          >
            Dungeon Master name
          </label>
          <input
            id="dm"
            type="text"
            placeholder="What do they call you at the table?"
            autoComplete="off"
            className={`${inputClass} px-4 py-[15px] text-[17px]`}
            {...register('username')}
          />
          {errors.username && (
            <p className="mt-2 text-[12.5px] text-monster">
              {errors.username.message}
            </p>
          )}
          {loginMutation.isError && (
            <p className="mt-2 text-[12.5px] text-monster">
              {loginMutation.error.message}
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            type="submit"
            className="mt-3.5 w-full"
            disabled={loginMutation.isPending}
          >
            Take your seat
            <ArrowRight className="size-[1.2em]" />
          </Button>
          <p className="mt-4 text-center text-[12.5px] leading-normal text-faint">
            No password, no fuss.{' '}
            <b className="font-semibold text-muted">
              A new name conjures a new account
            </b>{' '}
            — an old one picks up right where you left off.
          </p>
        </form>
      </main>
    </div>
  )
}
