'use client'

export type UploadedMedia = {
  mediaId: string
  width: number
  height: number
  ratio: number
  urls: {
    thumb: string
    display: string
  }
}

type UploadMediaOptions = {
  entryId: string
  file: File
  signal?: AbortSignal
}

export type MediaUploadError = Error & {
  status: number
}

const createMediaUploadError = (
  message: string,
  status: number,
): MediaUploadError => {
  const error = new Error(message) as MediaUploadError
  error.name = 'MediaUploadError'
  error.status = status

  return error
}

const isUploadedMedia = (value: unknown): value is UploadedMedia => {
  if (!value || typeof value !== 'object') return false

  const media = value as Partial<UploadedMedia>

  return (
    typeof media.mediaId === 'string' &&
    typeof media.width === 'number' &&
    typeof media.height === 'number' &&
    typeof media.ratio === 'number' &&
    typeof media.urls?.thumb === 'string' &&
    typeof media.urls.display === 'string'
  )
}

export const uploadMedia = async ({
  entryId,
  file,
  signal,
}: UploadMediaOptions): Promise<UploadedMedia> => {
  const formData = new FormData()
  formData.set('file', file)

  const response = await fetch(
    `/api/entries/${encodeURIComponent(entryId)}/media`,
    {
      method: 'POST',
      body: formData,
      signal,
    },
  )
  const payload = await response.json().catch(() => null) as unknown

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? payload.message
      : null

    throw createMediaUploadError(
      typeof message === 'string' ? message : 'Cette photo n’est pas passée.',
      response.status,
    )
  }

  if (!isUploadedMedia(payload)) {
    throw createMediaUploadError('La réponse du serveur est invalide.', 500)
  }

  return payload
}
