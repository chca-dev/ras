import { existsSync } from 'node:fs'
import { readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'

import { and, eq, isNotNull, lte } from 'drizzle-orm'

const retentionMilliseconds = 24 * 60 * 60 * 1000
const args = process.argv.slice(2)
const allowedArgs = new Set(['--dry-run', '--execute'])

if (args.some((arg) => !allowedArgs.has(arg))) {
  throw new Error('Option inconnue. Utilise --dry-run ou --execute.')
}

if (args.includes('--dry-run') && args.includes('--execute')) {
  throw new Error('Choisis soit --dry-run, soit --execute.')
}

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

const shouldExecute = args.includes('--execute')

const getDirectorySize = async (directory: string): Promise<number> => {
  let total = 0
  let entries

  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0
    throw error
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      total += await getDirectorySize(entryPath)
    } else if (entry.isFile()) {
      total += (await stat(entryPath)).size
    }
  }

  return total
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

const main = async () => {
  const [
    { db, postgresClient },
    { media },
    { resolveMediaKey },
  ] = await Promise.all([
    import('../src/db/client'),
    import('../src/db/schema/media'),
    import('../src/lib/media/storage'),
  ])
  const cutoff = new Date(Date.now() - retentionMilliseconds)

  try {
    const detachedMedia = await db
      .select({ id: media.id })
      .from(media)
      .where(and(isNotNull(media.detachedAt), lte(media.detachedAt, cutoff)))
    const temporaryRoot = resolveMediaKey('.tmp')
    const temporaryDirectories = []

    try {
      const entries = await readdir(temporaryRoot, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const directory = resolveMediaKey(path.join('.tmp', entry.name))
        const details = await stat(directory)

        if (details.mtime <= cutoff) {
          temporaryDirectories.push({ name: entry.name, directory })
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }

    const mediaCandidates = await Promise.all(
      detachedMedia.map(async ({ id }) => {
        const directory = resolveMediaKey(id)

        return {
          id,
          directory,
          size: await getDirectorySize(directory),
        }
      }),
    )
    const temporaryCandidates = await Promise.all(
      temporaryDirectories.map(async (candidate) => ({
        ...candidate,
        size: await getDirectorySize(candidate.directory),
      })),
    )
    const totalSize = [
      ...mediaCandidates.map(({ size }) => size),
      ...temporaryCandidates.map(({ size }) => size),
    ].reduce((total, size) => total + size, 0)

    console.log(shouldExecute ? 'Mode : exécution' : 'Mode : dry-run')
    console.log(`Médias détachés : ${mediaCandidates.length}`)
    console.log(`Dossiers temporaires : ${temporaryCandidates.length}`)
    console.log(`Espace récupérable : ${formatBytes(totalSize)}`)

    for (const candidate of mediaCandidates) {
      console.log(`- média ${candidate.id} : ${formatBytes(candidate.size)}`)
    }

    for (const candidate of temporaryCandidates) {
      console.log(`- temporaire ${candidate.name} : ${formatBytes(candidate.size)}`)
    }

    if (!shouldExecute) {
      console.log('Aucune suppression effectuée.')
      return
    }

    let removedMedia = 0
    let removedTemporaryDirectories = 0

    for (const candidate of mediaCandidates) {
      const [stillDetached] = await db
        .select({ id: media.id })
        .from(media)
        .where(
          and(
            eq(media.id, candidate.id),
            isNotNull(media.detachedAt),
            lte(media.detachedAt, cutoff),
          ),
        )
        .limit(1)

      if (!stillDetached) continue

      await rm(candidate.directory, { recursive: true, force: true })
      await db.delete(media).where(eq(media.id, candidate.id))
      removedMedia += 1
    }

    for (const candidate of temporaryCandidates) {
      await rm(candidate.directory, { recursive: true, force: true })
      removedTemporaryDirectories += 1
    }

    console.log(`Médias supprimés : ${removedMedia}`)
    console.log(`Dossiers temporaires supprimés : ${removedTemporaryDirectories}`)
  } finally {
    await postgresClient.end({ timeout: 5 })
  }
}

void main()
