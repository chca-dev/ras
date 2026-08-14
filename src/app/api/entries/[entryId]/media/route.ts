import { randomUUID } from 'node:crypto'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getEntryById } from '@/lib/entries/dal'
import {
  createProcessingMedia,
  markMediaFailed,
  markMediaReady,
} from '@/lib/media/dal'
import {
  maxImageBytes,
  processImage,
  type ProcessedImage,
} from '@/lib/media/process-image'
import { createMediaKeys } from '@/lib/media/storage'
import { writeProcessedMedia } from '@/lib/media/write-media'

const maxMultipartBytes = maxImageBytes + 1024 * 1024
const entryIdSchema = z.uuid()

const getSafeOriginalName = (name: string) => {
  return name
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .slice(0, 255) || 'photo'
}

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ entryId: string }> },
) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 })
  }

  const contentLength = Number(request.headers.get('content-length'))

  if (Number.isFinite(contentLength) && contentLength > maxMultipartBytes) {
    return NextResponse.json(
      { message: 'Cette photo dépasse la limite de 20 Mo.' },
      { status: 413 },
    )
  }

  const { entryId } = await params

  if (!entryIdSchema.safeParse(entryId).success) {
    return NextResponse.json({ message: 'Entrée introuvable.' }, { status: 404 })
  }

  const entry = await getEntryById(session.user.id, entryId)

  if (!entry) {
    return NextResponse.json({ message: 'Entrée introuvable.' }, { status: 404 })
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { message: 'Le formulaire envoyé est invalide.' },
      { status: 400 },
    )
  }

  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: 'Choisis une photo.' },
      { status: 400 },
    )
  }

  if (!file.size || file.size > maxImageBytes) {
    return NextResponse.json(
      { message: 'Cette photo dépasse la limite de 20 Mo.' },
      { status: 413 },
    )
  }

  let image: ProcessedImage

  try {
    image = await processImage(Buffer.from(await file.arrayBuffer()))
  } catch {
    return NextResponse.json(
      { message: 'Cette photo n’est pas passée. Utilise un fichier JPEG, PNG ou WebP.' },
      { status: 422 },
    )
  }

  const mediaId = randomUUID()
  const keys = createMediaKeys(mediaId)
  const createdMedia = await createProcessingMedia(
    session.user.id,
    entryId,
    {
      id: mediaId,
      originalName: getSafeOriginalName(file.name),
      image,
      keys,
    },
  )

  if (!createdMedia) {
    return NextResponse.json({ message: 'Entrée introuvable.' }, { status: 404 })
  }

  try {
    await writeProcessedMedia(mediaId, image)
    const readyMedia = await markMediaReady(session.user.id, mediaId)

    if (!readyMedia) {
      throw new Error('Transition média invalide')
    }

    return NextResponse.json(
      {
        mediaId,
        width: image.width,
        height: image.height,
        ratio: image.width / image.height,
        urls: {
          thumb: `/api/media/${mediaId}/thumb`,
          display: `/api/media/${mediaId}/display`,
        },
      },
      { status: 201 },
    )
  } catch {
    await markMediaFailed(session.user.id, mediaId)

    return NextResponse.json(
      { message: 'Cette photo n’a pas été enregistrée.' },
      { status: 500 },
    )
  }
}
