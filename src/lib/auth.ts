import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { count } from 'drizzle-orm'
import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'

import { db } from '@/db/client'
import * as schema from '@/db/schema'
import { env } from '@/lib/env'

const bootstrapEnabled =
  env.AUTH_BOOTSTRAP_ENABLED &&
  process.env.npm_lifecycle_event === 'auth:bootstrap'

export const auth = betterAuth({
  appName: env.NEXT_PUBLIC_APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: !bootstrapEnabled,
    autoSignIn: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          const [existingUsers] = await db
            .select({ value: count() })
            .from(schema.user)

          if (existingUsers.value !== 0) {
            throw new APIError('BAD_REQUEST', {
              message: 'Signup is disabled',
            })
          }
        },
      },
    },
  },
  telemetry: {
    enabled: false,
  },
})
