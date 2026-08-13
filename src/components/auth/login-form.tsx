'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { authClient } from '@/lib/auth-client'

const loginErrorMessage =
  'Ça ne correspond pas. Vérifie l’adresse et le mot de passe.'

export function LoginForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <div className="login-field">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>

      <p
        id="login-error"
        className="login-error"
        role="alert"
        aria-live="polite"
      >
        {error}
      </p>

      <button className="login-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
