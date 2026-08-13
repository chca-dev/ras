import { randomUUID } from 'node:crypto'

import { and, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { entries } from '@/db/schema'

const emptyDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function getTodayInParis() {
  const dateParts = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = dateParts.find(({ type }) => type === 'year')?.value
  const month = dateParts.find(({ type }) => type === 'month')?.value
  const day = dateParts.find(({ type }) => type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Impossible de déterminer la date du jour')
  }

  return `${year}-${month}-${day}`
}

export async function createEntry(ownerId: string) {
  const [entry] = await db
    .insert(entries)
    .values({
      id: randomUUID(),
      ownerId,
      entryDate: getTodayInParis(),
      content: emptyDocument,
    })
    .returning()

  return entry
}

export async function getEntryById(ownerId: string, entryId: string) {
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .limit(1)

  return entry ?? null
}

export async function hasEntries(ownerId: string) {
  const [entry] = await db
    .select({ id: entries.id })
    .from(entries)
    .where(eq(entries.ownerId, ownerId))
    .limit(1)

  return Boolean(entry)
}

type UpdateEntryValues = {
  title: string | null
  entryDate: string
  content: Record<string, unknown>
  plainText: string
}

export async function updateEntry(
  ownerId: string,
  entryId: string,
  values: UpdateEntryValues,
) {
  const [entry] = await db
    .update(entries)
    .set(values)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .returning()

  return entry ?? null
}

export async function deleteEntry(ownerId: string, entryId: string) {
  const [entry] = await db
    .delete(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .returning({ id: entries.id })

  return entry ?? null
}
