import { LogoutButton } from '@/components/auth/logout-button'
import { requireSession } from '@/lib/auth/require-session'

export default async function SettingsPage() {
  const session = await requireSession()

  return (
    <main className="shell-page">
      <header className="shell-page-heading">
        <p className="shell-page-kicker">Compte et application</p>
        <h1>Réglages</h1>
      </header>

      <div className="settings-list">
        <section className="settings-row" aria-labelledby="account-heading">
          <div>
            <h2 id="account-heading">Compte</h2>
            <p>{session.user.email}</p>
          </div>
        </section>

        <section className="settings-row" aria-labelledby="install-heading">
          <div>
            <h2 id="install-heading">Installer RAS.</h2>
            <p>
              L’ajout à l’écran d’accueil sera disponible avec le manifest PWA.
            </p>
          </div>
        </section>

        <section className="settings-row" aria-labelledby="session-heading">
          <div>
            <h2 id="session-heading">Session</h2>
            <p>Fermer cette session sur cet appareil.</p>
          </div>
          <LogoutButton />
        </section>
      </div>
    </main>
  )
}
