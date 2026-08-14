import { readFile } from 'node:fs/promises'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { getReadyMediaById } from '@/lib/media/dal'
import {
  getMediaKeyForVariant,
  resolveMediaKey,
  type MediaVariant,
} from '@/lib/media/storage'

const paramsSchema = z.object({
  mediaId: z.uuid(),
  variant: z.enum(['original', 'display', 'thumb']),
})

const createContentDisposition = (variant: MediaVariant, name: string) => {
  if (variant !== 'original') return 'inline'

  return `attachment; filename*=UTF-8''${encodeURIComponent(name)}`
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ mediaId: string; variant: string }> },
) => {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse(await params)

  if (!parsedParams.success) {
    return NextResponse.json({ message: 'Média introuvable.' }, { status: 404 })
  }

  const { mediaId, variant } = parsedParams.data
  const readyMedia = await getReadyMediaById(session.user.id, mediaId)

  if (!readyMedia) {
    return NextResponse.json({ message: 'Média introuvable.' }, { status: 404 })
  }

  const etag = `"${readyMedia.checksum}-${variant}"`

  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag },
    })
  }

  const key = getMediaKeyForVariant(readyMedia, variant)

  if (!key) {
    return NextResponse.json({ message: 'Média introuvable.' }, { status: 404 })
  }

  try {
    const file = await readFile(resolveMediaKey(key))
    const contentType = variant === 'original'
      ? readyMedia.originalMime ?? 'application/octet-stream'
      : 'image/webp'

    return new Response(new Uint8Array(file), {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': createContentDisposition(
          variant,
          readyMedia.originalName,
        ),
        'Content-Length': String(file.byteLength),
        'Content-Type': contentType,
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ message: 'Média introuvable.' }, { status: 404 })
  }
}
