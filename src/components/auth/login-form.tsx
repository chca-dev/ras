'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { authClient } from '@/lib/auth-client'

const loginErrorMessage =
  'Ça ne correspond pas. Vérifie l’adresse et le mot de passe.'

export const LoginForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(loginErrorMessage)
        return
      }

      router.replace('/journal')
      router.refresh()
    } catch {
      setError(loginErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className='w-full' onSubmit={handleSubmit} noValidate>
      <div className='flex flex-col gap-4'>
      <label className='flex flex-col gap-1.5' htmlFor='email'>
        <span className='pl-0.5 font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground'>E-mail</span>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-describedby={error ? 'login-error' : undefined}
          className='h-12 rounded-xl border border-border bg-card px-4 font-sans text-[0.95rem] text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10'
        />
      </label>

      <label className='flex flex-col gap-1.5' htmlFor='password'>
        <span className='pl-0.5 font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground'>Mot de passe</span>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={error ? 'login-error' : undefined}
          className='h-12 rounded-xl border border-border bg-card px-4 font-sans text-[0.95rem] text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10'
        />
      </label>

      <p
        id="login-error"
        className='min-h-5 font-sans text-sm text-destructive'
        role="alert"
        aria-live="polite"
      >
        {error}
      </p>

      <button className='mt-2 h-12 rounded-xl bg-primary font-sans text-[0.95rem] font-medium text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60' type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
      </div>
    </form>
  )
}
