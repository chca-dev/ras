import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgresql://'),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  MEDIA_ROOT: z.string().min(1),
  APP_TIME_ZONE: z.string().default('Europe/Paris'),
  NEXT_PUBLIC_APP_NAME: z.string().default('RAS.'),
})

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  MEDIA_ROOT: process.env.MEDIA_ROOT,
  APP_TIME_ZONE: process.env.APP_TIME_ZONE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
})
