'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authClient } from '@/lib/auth-client'

export const LogoutButton = () => {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
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
        className='py-1 text-left font-sans text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60'
        type="button"
        disabled={isSigningOut}
        onClick={handleSignOut}
      >
        {isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
      </button>

      {error ? (
        <p className='mt-2 font-sans text-xs text-destructive' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  )
}
