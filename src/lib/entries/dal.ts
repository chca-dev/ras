import { randomUUID } from 'node:crypto'

import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db/client'
import { entries, media } from '@/db/schema'
import {
  parsePhotoGroupAttrs,
  parseTiptapDocument,
  type PhotoGroupItem,
  type TiptapNode,
} from '@/lib/tiptap/document'

const emptyDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

const entriesPageSize = 10
const entryIdSchema = z.uuid()

const getEntryMediaItems = (content: Record<string, unknown>) => {
  const document = parseTiptapDocument(content)

  if (!document) return []

  const mediaItems: PhotoGroupItem[] = []
  const visitNode = (node: TiptapNode) => {
    if (node.type === 'photoGroup') {
      const attrs = parsePhotoGroupAttrs(node.attrs)

      if (attrs) mediaItems.push(...attrs.items)
    }

    node.content?.forEach(visitNode)
  }

  visitNode(document)

  return mediaItems
}

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
  if (!entryIdSchema.safeParse(entryId).success) return null

  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .limit(1)

  return entry ?? null
}

export const getAdjacentEntries = async (
  ownerId: string,
  entry: Pick<typeof entries.$inferSelect, 'id' | 'entryDate' | 'createdAt'>,
) => {
  const olderCondition = or(
    lt(entries.entryDate, entry.entryDate),
    and(
      eq(entries.entryDate, entry.entryDate),
      lt(entries.createdAt, entry.createdAt),
    ),
    and(
      eq(entries.entryDate, entry.entryDate),
      eq(entries.createdAt, entry.createdAt),
      lt(entries.id, entry.id),
    ),
  )
  const newerCondition = or(
    gt(entries.entryDate, entry.entryDate),
    and(
      eq(entries.entryDate, entry.entryDate),
      gt(entries.createdAt, entry.createdAt),
    ),
    and(
      eq(entries.entryDate, entry.entryDate),
      eq(entries.createdAt, entry.createdAt),
      gt(entries.id, entry.id),
    ),
  )

  const [olderEntries, newerEntries] = await Promise.all([
    db
      .select({ id: entries.id })
      .from(entries)
      .where(and(eq(entries.ownerId, ownerId), olderCondition))
      .orderBy(
        desc(entries.entryDate),
        desc(entries.createdAt),
        desc(entries.id),
      )
      .limit(1),
    db
      .select({ id: entries.id })
      .from(entries)
      .where(and(eq(entries.ownerId, ownerId), newerCondition))
      .orderBy(
        asc(entries.entryDate),
        asc(entries.createdAt),
        asc(entries.id),
      )
      .limit(1),
  ])

  return {
    previousEntry: olderEntries[0] ?? null,
    nextEntry: newerEntries[0] ?? null,
  }
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
    entries: pageEntries.map((entry) => ({
      ...entry,
      mediaItems: getEntryMediaItems(entry.content),
    })),
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
  mediaIds: string[]
  expectedRevision: number
}

type UpdateEntryResult =
  | { status: 'updated'; entry: typeof entries.$inferSelect }
  | { status: 'conflict' }
  | { status: 'invalid-media' }

export const updateEntry = async (
  ownerId: string,
  entryId: string,
  values: UpdateEntryValues,
): Promise<UpdateEntryResult> => {
  if (!entryIdSchema.safeParse(entryId).success) {
    return { status: 'conflict' }
  }

  const {
    expectedRevision,
    mediaIds,
    ...entryValues
  } = values

  return db.transaction(async (transaction): Promise<UpdateEntryResult> => {
    if (mediaIds.length) {
      const readyMedia = await transaction
        .select({ id: media.id })
        .from(media)
        .where(
          and(
            eq(media.ownerId, ownerId),
            eq(media.entryId, entryId),
            eq(media.status, 'ready'),
            inArray(media.id, mediaIds),
          ),
        )

      if (readyMedia.length !== mediaIds.length) {
        return { status: 'invalid-media' }
      }
    }

    const [entry] = await transaction
      .update(entries)
      .set({
        ...entryValues,
        coverMediaId: mediaIds[0] ?? null,
        revision: sql`${entries.revision} + 1`,
      })
      .where(
        and(
          eq(entries.id, entryId),
          eq(entries.ownerId, ownerId),
          eq(entries.revision, expectedRevision),
        ),
      )
      .returning()

    if (!entry) {
      return { status: 'conflict' }
    }

    if (mediaIds.length) {
      await transaction
        .update(media)
        .set({ detachedAt: null })
        .where(
          and(
            eq(media.ownerId, ownerId),
            eq(media.entryId, entryId),
            eq(media.status, 'ready'),
            inArray(media.id, mediaIds),
          ),
        )
    }

    const removedMediaCondition = mediaIds.length
      ? notInArray(media.id, mediaIds)
      : undefined

    await transaction
      .update(media)
      .set({ detachedAt: new Date() })
      .where(
        and(
          eq(media.ownerId, ownerId),
          eq(media.entryId, entryId),
          eq(media.status, 'ready'),
          isNull(media.detachedAt),
          removedMediaCondition,
        ),
      )

    return { status: 'updated', entry }
  })
}

export const deleteEntry = async (ownerId: string, entryId: string) => {
  if (!entryIdSchema.safeParse(entryId).success) return null

  return db.transaction(async (transaction) => {
    const [ownedEntry] = await transaction
      .select({ id: entries.id })
      .from(entries)
      .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
      .limit(1)

    if (!ownedEntry) return null

    const entryMedia = await transaction
      .select({ id: media.id })
      .from(media)
      .where(
        and(
          eq(media.ownerId, ownerId),
          eq(media.entryId, ownedEntry.id),
        ),
      )

    const [deletedEntry] = await transaction
      .delete(entries)
      .where(
        and(
          eq(entries.id, ownedEntry.id),
          eq(entries.ownerId, ownerId),
        ),
      )
      .returning({ id: entries.id })

    if (!deletedEntry) return null

    return {
      entry: deletedEntry,
      mediaIds: entryMedia.map(({ id }) => id),
    }
  })
}
