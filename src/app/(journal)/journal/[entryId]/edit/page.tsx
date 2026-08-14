import { notFound } from 'next/navigation'

import { EntryForm } from '@/components/entries/entry-form'
import { requireSession } from '@/lib/auth/require-session'
import { getEntryById } from '@/lib/entries/dal'
import { createDocumentFromPlainText, parseTiptapDocument } from '@/lib/tiptap/document'

const EditEntryPage = async ({
  params,
}: {
  params: Promise<{ entryId: string }>
}) => {
  const [{ entryId }, session] = await Promise.all([
    params,
    requireSession(),
  ])
  const entry = await getEntryById(session.user.id, entryId)

  if (!entry) {
    notFound()
  }

  return (
    <main>
      <EntryForm
        entry={{
          id: entry.id,
          title: entry.title,
          entryDate: entry.entryDate,
          revision: entry.revision,
          content: parseTiptapDocument(entry.content) ?? createDocumentFromPlainText(entry.plainText),
        }}
      />
    </main>
  )
}

export default EditEntryPage
