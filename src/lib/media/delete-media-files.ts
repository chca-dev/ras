import { rm } from 'node:fs/promises'

import { resolveMediaKey } from '@/lib/media/storage'

type MediaRemovalFailure = {
  mediaId: string
  code: string
}

const getErrorCode = (error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code
  }

  return 'UNKNOWN'
}

export const deleteMediaDirectories = async (mediaIds: string[]) => {
  const results = await Promise.all(
    mediaIds.map(async (mediaId): Promise<MediaRemovalFailure | null> => {
      try {
        await rm(resolveMediaKey(mediaId), { recursive: true, force: true })
        return null
      } catch (error) {
        return { mediaId, code: getErrorCode(error) }
      }
    }),
  )

  return results.filter(
    (result): result is MediaRemovalFailure => result !== null,
  )
}
