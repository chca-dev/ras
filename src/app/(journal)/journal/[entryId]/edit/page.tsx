import { notFound } from 'next/navigation'

import { DeleteEntryButton } from '@/components/entries/delete-entry-button'
import { EntryForm } from '@/components/entries/entry-form'
import { requireSession } from '@/lib/auth/require-session'
import { getEntryById } from '@/lib/entries/dal'

export default async function EditEntryPage({
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

  return (
    <main className="shell-page entry-editor-page">
      <EntryForm
        entry={{
          id: entry.id,
          title: entry.title,
          entryDate: entry.entryDate,
          plainText: entry.plainText,
        }}
      />
      <DeleteEntryButton entryId={entry.id} />
    </main>
  )
}
