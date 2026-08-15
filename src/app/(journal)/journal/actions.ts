'use server'

import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'

import { requireSession } from '@/lib/auth/require-session'
import { createEntry, deleteEntry, updateEntry } from '@/lib/entries/dal'
import { updateEntrySchema } from '@/lib/entries/validation'
import { deleteMediaDirectories } from '@/lib/media/delete-media-files'
import {
  getTiptapMediaIds,
  getTiptapPlainText,
  parseSerializedTiptapDocument,
} from '@/lib/tiptap/document'

export type UpdateEntryState = {
  status: 'success' | 'error' | 'conflict'
  message: string
  revision?: number
  fieldErrors?: {
    title?: string[]
    entryDate?: string[]
    content?: string[]
  }
}

export type UpdateEntryPayload = {
  title: string
  entryDate: string
  content: string
  revision: number
}

export const createEntryAction = async () => {
  const session = await requireSession()
  const entry = await createEntry(session.user.id)

  redirect(`/journal/${entry.id}/edit`)
}

export const updateEntryAction = async (
  entryId: string,
  payload: UpdateEntryPayload,
): Promise<UpdateEntryState> => {
  const session = await requireSession()
  const result = updateEntrySchema.safeParse(payload)

  if (!result.success) {
    return {
      status: 'error',
      message: 'Certains champs ont besoin d’être corrigés.',
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  const content = parseSerializedTiptapDocument(result.data.content)

  if (!content) {
    return {
      status: 'error',
      message: 'Le contenu de l’entrée est invalide.',
      fieldErrors: { content: ['Le contenu de l’entrée est invalide.'] },
    }
  }

  const updateResult = await updateEntry(session.user.id, entryId, {
    title: result.data.title || null,
    entryDate: result.data.entryDate,
    content,
    plainText: getTiptapPlainText(content),
    mediaIds: getTiptapMediaIds(content),
    expectedRevision: result.data.revision,
  })

  if (updateResult.status === 'invalid-media') {
    return {
      status: 'error',
      message: 'Une photo de cette entree est invalide. Recharge la page.',
      fieldErrors: { content: ['Une photo de cette entree est invalide.'] },
    }
  }

  if (updateResult.status === 'conflict') {
    return {
      status: 'conflict',
      message: 'Cette entrée a changé dans un autre onglet. Recharge la page.',
    }
  }

  revalidatePath('/journal')
  revalidatePath('/archives')
  revalidatePath(`/journal/${entryId}`)

  return {
    status: 'success',
    message: 'Enregistré',
    revision: updateResult.entry.revision,
  }
}

export const deleteEntryAction = async (entryId: string) => {
  const session = await requireSession()
  const deletion = await deleteEntry(session.user.id, entryId)

  if (!deletion) {
    notFound()
  }

  const mediaRemovalFailures = await deleteMediaDirectories(deletion.mediaIds)

  mediaRemovalFailures.forEach(({ mediaId, code }) => {
    console.error(`Suppression du média ${mediaId} échouée (${code})`)
  })

  redirect('/journal')
}
