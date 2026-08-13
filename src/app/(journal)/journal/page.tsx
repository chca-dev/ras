import { LogoutButton } from '@/components/auth/logout-button'

export default function JournalPage() {
  return (
    <main className="diagnostic-page">
      <p className="diagnostic-kicker">Journal personnel</p>
      <h1>RAS.</h1>
      <p className="diagnostic-copy">Connexion validée.</p>
      <LogoutButton />
    </main>
  )
}
