import { and, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { entries, media } from '@/db/schema'
import type { ProcessedImage } from '@/lib/media/process-image'

type MediaKeys = {
  display: string
  thumb: string
}

type CreateProcessingMediaValues = {
  id: string
  originalName: string
  image: ProcessedImage
  keys: MediaKeys
}

export const createProcessingMedia = async (
  ownerId: string,
  entryId: string,
  values: CreateProcessingMediaValues,
) => {
  const [ownedEntry] = await db
    .select({ id: entries.id })
    .from(entries)
    .where(and(eq(entries.id, entryId), eq(entries.ownerId, ownerId)))
    .limit(1)

  if (!ownedEntry) return null

  const [createdMedia] = await db
    .insert(media)
    .values({
      id: values.id,
      ownerId,
      entryId,
      status: 'processing',
      originalName: values.originalName,
      displaySize: values.image.displaySize,
      thumbSize: values.image.thumbSize,
      width: values.image.width,
      height: values.image.height,
      displayKey: values.keys.display,
      thumbKey: values.keys.thumb,
      checksum: values.image.checksum,
      detachedAt: new Date(),
    })
    .returning()

  return createdMedia
}

export const markMediaReady = async (ownerId: string, mediaId: string) => {
  const [updatedMedia] = await db
    .update(media)
    .set({ status: 'ready' })
    .where(
      and(
        eq(media.id, mediaId),
        eq(media.ownerId, ownerId),
        eq(media.status, 'processing'),
      ),
    )
    .returning()

  return updatedMedia ?? null
}

export const markMediaFailed = async (ownerId: string, mediaId: string) => {
  const [updatedMedia] = await db
    .update(media)
    .set({ status: 'failed' })
    .where(
      and(
        eq(media.id, mediaId),
        eq(media.ownerId, ownerId),
        eq(media.status, 'processing'),
      ),
    )
    .returning()

  return updatedMedia ?? null
}

export const getReadyMediaById = async (
  ownerId: string,
  mediaId: string,
) => {
  const [readyMedia] = await db
    .select()
    .from(media)
    .where(
      and(
        eq(media.id, mediaId),
        eq(media.ownerId, ownerId),
        eq(media.status, 'ready'),
      ),
    )
    .limit(1)

  return readyMedia ?? null
}
