import { existsSync } from 'node:fs'

import { defineConfig } from 'drizzle-kit'
import { z } from 'zod'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

const databaseUrl = z
  .url()
  .startsWith('postgresql://')
  .parse(process.env.DATABASE_URL)

export default defineConfig({
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
})
