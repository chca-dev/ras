import path from 'node:path'

import { env } from '@/lib/env'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type MediaVariant = 'original' | 'display' | 'thumb'

export const mediaRoot = path.resolve(env.MEDIA_ROOT)

export const resolveMediaKey = (key: string) => {
  if (!key || path.isAbsolute(key)) {
    throw new Error('Clé média invalide')
  }

  const resolvedPath = path.resolve(mediaRoot, key)
  const relativePath = path.relative(mediaRoot, resolvedPath)

  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error('La clé média sort du stockage privé')
  }

  return resolvedPath
}

export const createMediaKeys = (
  mediaId: string,
) => {
  if (!uuidPattern.test(mediaId)) {
    throw new Error('Identifiant média invalide')
  }

  return {
    display: `${mediaId}/display.webp`,
    thumb: `${mediaId}/thumb.webp`,
  }
}

export const getMediaKeyForVariant = (
  keys: {
    originalKey: string | null
    displayKey: string
    thumbKey: string
  },
  variant: MediaVariant,
) => {
  const keyByVariant = {
    original: keys.originalKey,
    display: keys.displayKey,
    thumb: keys.thumbKey,
  }

  return keyByVariant[variant] ?? null
}
