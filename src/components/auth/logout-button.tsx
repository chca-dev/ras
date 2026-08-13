'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setError(null)
    setIsSigningOut(true)

    try {
      const result = await authClient.signOut()

      if (result.error) {
        setError('La déconnexion n’a pas fonctionné. Réessaie.')
        return
      }

      router.replace('/login')
      router.refresh()
    } catch {
      setError('La déconnexion n’a pas fonctionné. Réessaie.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div>
      <button
        className="login-submit"
        type="button"
        disabled={isSigningOut}
        onClick={handleSignOut}
      >
        {isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
      </button>

      {error ? (
        <p className="login-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
