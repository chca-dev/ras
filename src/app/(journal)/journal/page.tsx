import { TimelineView } from '@/components/journal/timeline-view'
import { requireSession } from '@/lib/auth/require-session'
import { getTodayInParis } from '@/lib/dates/format-civil-date'
import { listEntriesPage } from '@/lib/entries/dal'

const JournalPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[] }>
}) => {
  const { cursor: cursorParam } = await searchParams
  const cursor = typeof cursorParam === 'string' ? cursorParam : undefined
  const session = await requireSession()
  const page = await listEntriesPage(session.user.id, cursor)
  const today = getTodayInParis()

  return <TimelineView entries={page.entries} nextCursor={page.nextCursor} cursor={cursor} today={today} />
}

export default JournalPage
