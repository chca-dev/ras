import { PenLine } from 'lucide-react'

import { createEntryAction } from '@/app/(journal)/journal/actions'
import { requireSession } from '@/lib/auth/require-session'
import { hasEntries } from '@/lib/entries/dal'

export default async function JournalPage() {
  const session = await requireSession()
  const journalHasEntries = await hasEntries(session.user.id)

  return (
    <main className="shell-page">
      <header className="shell-page-heading">
        <p className="shell-page-kicker">Journal personnel</p>
        <h1>Journal</h1>
      </header>

      {journalHasEntries ? (
        <p className="shell-empty-state journal-awaiting-timeline">
          Les entrées sont bien là. La chronologie arrive juste après.
        </p>
      ) : (
        <section className="journal-empty-state">
          <p>Il ne s’est rien passé. Version officielle.</p>
          <form action={createEntryAction}>
            <button type="submit">
              <PenLine aria-hidden="true" size={18} strokeWidth={1.75} />
              Écrire la première entrée
            </button>
          </form>
        </section>
      )}
    </main>
  )
}
