'use server'

import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'

import { requireSession } from '@/lib/auth/require-session'
import { createEntry, deleteEntry, updateEntry } from '@/lib/entries/dal'
import { updateEntrySchema } from '@/lib/entries/validation'

export type UpdateEntryState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: {
    title?: string[]
    entryDate?: string[]
    body?: string[]
  }
}

const createTextDocument = (body: string) => {
  const lines = body.split('\n')

  return {
    type: 'doc',
    content: lines.map((line) => ({
      type: 'paragraph',
      ...(line ? { content: [{ type: 'text', text: line }] } : {}),
    })),
  }
}

export const createEntryAction = async () => {
  const session = await requireSession()
  const entry = await createEntry(session.user.id)

  redirect(`/journal/${entry.id}/edit`)
}

export const updateEntryAction = async (
  entryId: string,
  _previousState: UpdateEntryState,
  formData: FormData,
): Promise<UpdateEntryState> => {
  const session = await requireSession()
  const result = updateEntrySchema.safeParse({
    title: formData.get('title'),
    entryDate: formData.get('entryDate'),
    body: formData.get('body'),
  })

  if (!result.success) {
    return {
      status: 'error',
      message: 'Certains champs ont besoin d’être corrigés.',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  const entry = await updateEntry(session.user.id, entryId, {
    title: result.data.title || null,
    entryDate: result.data.entryDate,
    content: createTextDocument(result.data.body),
    plainText: result.data.body,
  })

  if (!entry) {
    notFound()
  }

  revalidatePath(`/journal/${entryId}/edit`)

  return {
    status: 'success',
    message: 'Enregistré',
  }
}

export const deleteEntryAction = async (entryId: string) => {
  const session = await requireSession()
  const entry = await deleteEntry(session.user.id, entryId)

  if (!entry) {
    notFound()
  }

  redirect('/journal')
}
