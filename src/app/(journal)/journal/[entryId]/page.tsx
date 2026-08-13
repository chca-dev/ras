import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DeleteEntryButton } from '@/components/entries/delete-entry-button'
import { requireSession } from '@/lib/auth/require-session'
import { formatCivilDate } from '@/lib/dates/format-civil-date'
import { getEntryById } from '@/lib/entries/dal'

export default async function EntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const [{ entryId }, session] = await Promise.all([
    params,
    requireSession(),
  ])
  const entry = await getEntryById(session.user.id, entryId)

  if (!entry) {
    notFound()
  }

  const paragraphs = entry.plainText.split('\n')

  return (
    <main className="shell-page entry-reading-page">
      <nav className="entry-reading-actions" aria-label="Actions de l’entrée">
        <Link href="/journal">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
          Journal
        </Link>
        <Link href={`/journal/${entry.id}/edit`}>
          <Pencil aria-hidden="true" size={17} strokeWidth={1.75} />
          Modifier
        </Link>
      </nav>

      <article>
        <header className="entry-reading-heading">
          <time dateTime={entry.entryDate}>
            {formatCivilDate(entry.entryDate)}
          </time>
          {entry.title ? <h1>{entry.title}</h1> : null}
        </header>

        <div className="entry-reading-content">
          {entry.plainText ? (
            paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{paragraph || '\u00a0'}</p>
            ))
          ) : (
            <p className="entry-reading-empty">Rien à signaler, donc.</p>
          )}
        </div>
      </article>

      <DeleteEntryButton entryId={entry.id} />
    </main>
  )
}
