import { createHash } from 'node:crypto'

import sharp from 'sharp'

const maxInputPixels = 100_000_000
const maxDimension = 20_000

const supportedFormats = {
  jpeg: {
    extension: 'jpg',
    mime: 'image/jpeg',
  },
  png: {
    extension: 'png',
    mime: 'image/png',
  },
  webp: {
    extension: 'webp',
    mime: 'image/webp',
  },
} as const

export const maxImageBytes = 20 * 1024 * 1024

export type ProcessedImage = {
  display: Buffer
  thumb: Buffer
  displaySize: number
  thumbSize: number
  width: number
  height: number
  checksum: string
}

const createInvalidImageError = (message: string) => new Error(message)

export const processImage = async (input: Buffer): Promise<ProcessedImage> => {
  if (!input.length || input.length > maxImageBytes) {
    throw createInvalidImageError('Cette photo dépasse la limite de 20 Mo.')
  }

  const image = sharp(input, {
    failOn: 'error',
    limitInputPixels: maxInputPixels,
    sequentialRead: true,
  })
  const metadata = await image.metadata()
  const format = metadata.format as keyof typeof supportedFormats | undefined
  const formatDetails = format ? supportedFormats[format] : undefined
  const width = metadata.width
  const height = metadata.height

  if (!formatDetails) {
    throw createInvalidImageError('Utilise une photo JPEG, PNG ou WebP.')
  }

  if (!width || !height || width > maxDimension || height > maxDimension) {
    throw createInvalidImageError('Les dimensions de cette photo sont invalides.')
  }

  if ((metadata.pages ?? 1) > 1) {
    throw createInvalidImageError('Les images animées ne sont pas acceptées.')
  }

  const orientedImage = image.clone().rotate()
  const [displayResult, thumb] = await Promise.all([
    orientedImage
      .clone()
      .resize({
        width: 3840,
        height: 3840,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true }),
    orientedImage
      .clone()
      .resize({
        width: 640,
        height: 640,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 76 })
      .toBuffer(),
  ])

  return {
    display: displayResult.data,
    thumb,
    displaySize: displayResult.data.length,
    thumbSize: thumb.length,
    width: displayResult.info.width,
    height: displayResult.info.height,
    checksum: createHash('sha256').update(displayResult.data).digest('hex'),
  }
}
