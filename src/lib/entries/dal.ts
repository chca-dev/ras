import { randomUUID } from 'node:crypto'

import { and, desc, eq, lt, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db/client'
import { entries } from '@/db/schema'

const emptyDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

const entriesPageSize = 10

const entriesCursorSchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.iso.datetime(),
  id: z.uuid(),
})

const encodeEntriesCursor = (entry: {
  entryDate: string
  createdAt: Date
  id: string
}) => {
  return Buffer.from(
    JSON.stringify({
      entryDate: entry.entryDate,
      createdAt: entry.createdAt.toISOString(),
      id: entry.id,
    }),
  ).toString('base64url')
}

const decodeEntriesCursor = (cursor: string) => {
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    const result = entriesCursorSchema.safeParse(value)

    return result.success
      ? {
          entryDate: result.data.entryDate,
          createdAt: new Date(result.data.createdAt),
          id: result.data.id,
        }
      : null
  } catch {
    return null
  }
}

const getTodayInParis = () => {
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

export const createEntry = async (ownerId: string) => {
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

export const getEntryById = async (ownerId: string, entryId: string) => {
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .limit(1)

  return entry ?? null
}

export const listEntriesPage = async (ownerId: string, cursor?: string) => {
  const decodedCursor = cursor ? decodeEntriesCursor(cursor) : null
  const cursorCondition = decodedCursor
    ? or(
        lt(entries.entryDate, decodedCursor.entryDate),
        and(
          eq(entries.entryDate, decodedCursor.entryDate),
          lt(entries.createdAt, decodedCursor.createdAt),
        ),
        and(
          eq(entries.entryDate, decodedCursor.entryDate),
          eq(entries.createdAt, decodedCursor.createdAt),
          lt(entries.id, decodedCursor.id),
        ),
      )
    : undefined

  const rows = await db
    .select()
    .from(entries)
    .where(
      cursorCondition
        ? and(eq(entries.ownerId, ownerId), cursorCondition)
        : eq(entries.ownerId, ownerId),
    )
    .orderBy(
      desc(entries.entryDate),
      desc(entries.createdAt),
      desc(entries.id),
    )
    .limit(entriesPageSize + 1)

  const pageEntries = rows.slice(0, entriesPageSize)
  const lastEntry = pageEntries.at(-1)

  return {
    entries: pageEntries,
    nextCursor:
      rows.length > entriesPageSize && lastEntry
        ? encodeEntriesCursor(lastEntry)
        : null,
  }
}

type UpdateEntryValues = {
  title: string | null
  entryDate: string
  content: Record<string, unknown>
  plainText: string
}

export const updateEntry = async (
  ownerId: string,
  entryId: string,
  values: UpdateEntryValues,
) => {
  const [entry] = await db
    .update(entries)
    .set(values)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .returning()

  return entry ?? null
}

export const deleteEntry = async (ownerId: string, entryId: string) => {
  const [entry] = await db
    .delete(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .returning({ id: entries.id })

  return entry ?? null
}
