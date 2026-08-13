import { PenLine } from 'lucide-react'
import Link from 'next/link'

import { createEntryAction } from '@/app/(journal)/journal/actions'
import type { Entry } from '@/db/schema'
import { requireSession } from '@/lib/auth/require-session'
import {
  formatCivilDayNumber,
  formatCivilMonth,
  formatCivilWeekday,
} from '@/lib/dates/format-civil-date'
import { listEntriesPage } from '@/lib/entries/dal'

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>
}) {
  const { cursor: cursorParam } = await searchParams
  const cursor = typeof cursorParam === 'string' ? cursorParam : undefined
  const session = await requireSession()
  const page = await listEntriesPage(session.user.id, cursor)
  const entriesByMonth = new Map<string, Entry[]>()

  for (const entry of page.entries) {
    const monthKey = entry.entryDate.slice(0, 7)
    const monthEntries = entriesByMonth.get(monthKey) ?? []

    monthEntries.push(entry)
    entriesByMonth.set(monthKey, monthEntries)
  }

  return (
    <main className="shell-page">
      <header className="shell-page-heading">
        <p className="shell-page-kicker">Journal personnel</p>
        <h1>Journal</h1>
      </header>

      {page.entries.length === 0 && !cursor ? (
        <section className="journal-empty-state">
          <p>Il ne s’est rien passé. Version officielle.</p>
          <form action={createEntryAction}>
            <button type="submit">
              <PenLine aria-hidden="true" size={18} strokeWidth={1.75} />
              Écrire la première entrée
            </button>
          </form>
        </section>
      ) : (
        <div className="journal-timeline">
          {Array.from(entriesByMonth.entries()).map(
            ([monthKey, monthEntries]) => (
              <section className="journal-month" key={monthKey}>
                <h2>{formatCivilMonth(monthEntries[0].entryDate)}</h2>

                <div className="journal-month-entries">
                  {monthEntries.map((entry) => {
                    const excerpt = entry.plainText.trim().replace(/\s+/g, ' ')

                    return (
                      <article className="journal-entry-preview" key={entry.id}>
                        <Link href={`/journal/${entry.id}`}>
                          <time dateTime={entry.entryDate}>
                            <span className="journal-entry-day">
                              {formatCivilDayNumber(entry.entryDate)}
                            </span>
                            <span className="journal-entry-weekday">
                              {formatCivilWeekday(entry.entryDate)}
                            </span>
                          </time>

                          <div className="journal-entry-summary">
                            {entry.title ? <h3>{entry.title}</h3> : null}
                            <p>
                              {excerpt
                                ? `${excerpt.slice(0, 220)}${excerpt.length > 220 ? '…' : ''}`
                                : 'Rien à signaler, donc.'}
                            </p>
                          </div>
                        </Link>
                      </article>
                    )
                  })}
                </div>
              </section>
            ),
          )}

          <nav className="journal-pagination" aria-label="Pagination du journal">
            {cursor ? <Link href="/journal">Entrées récentes</Link> : <span />}
            {page.nextCursor ? (
              <Link href={`/journal?cursor=${encodeURIComponent(page.nextCursor)}`}>
                Entrées précédentes
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </main>
  )
}
