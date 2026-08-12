import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

const globalForDatabase = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined
}

const postgresClient =
  globalForDatabase.postgresClient ?? postgres(env.DATABASE_URL, { max: 5 })

if (process.env.NODE_ENV !== 'production') {
  globalForDatabase.postgresClient = postgresClient
}

export const db = drizzle(postgresClient)

export { postgresClient }
