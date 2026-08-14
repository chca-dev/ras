import {
  mkdir,
  mkdtemp,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

import type { ProcessedImage } from '@/lib/media/process-image'
import {
  createMediaKeys,
  resolveMediaKey,
} from '@/lib/media/storage'

export const writeProcessedMedia = async (
  mediaId: string,
  image: ProcessedImage,
) => {
  const keys = createMediaKeys(mediaId)
  const temporaryRoot = resolveMediaKey('.tmp')
  const finalDirectory = resolveMediaKey(mediaId)

  await mkdir(temporaryRoot, { recursive: true })

  const temporaryDirectory = await mkdtemp(
    path.join(temporaryRoot, `${mediaId}-`),
  )

  try {
    await writeFile(
      path.join(temporaryDirectory, path.basename(keys.display)),
      image.display,
      { flag: 'wx' },
    )
    await writeFile(
      path.join(temporaryDirectory, path.basename(keys.thumb)),
      image.thumb,
      { flag: 'wx' },
    )

    await rename(temporaryDirectory, finalDirectory)

    return keys
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true })
    throw error
  }
}
