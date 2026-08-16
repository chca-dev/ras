import { existsSync } from 'node:fs'

import { z } from 'zod'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

const createUserEnv = z
  .object({
    CREATE_USER_NAME: z.string().trim().min(1).max(120),
    CREATE_USER_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
    CREATE_USER_PASSWORD: z.string().min(12).max(128),
    AUTH_USER_CREATION_ENABLED: z.literal('true'),
  })
  .parse({
    CREATE_USER_NAME: process.env.CREATE_USER_NAME,
    CREATE_USER_EMAIL: process.env.CREATE_USER_EMAIL,
    CREATE_USER_PASSWORD: process.env.CREATE_USER_PASSWORD,
    AUTH_USER_CREATION_ENABLED: process.env.AUTH_USER_CREATION_ENABLED,
  })

const main = async () => {
  const [{ auth }, { postgresClient }] = await Promise.all([
    import('../src/lib/auth'),
    import('../src/db/client'),
  ])

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: createUserEnv.CREATE_USER_NAME,
        email: createUserEnv.CREATE_USER_EMAIL,
        password: createUserEnv.CREATE_USER_PASSWORD,
      },
    })

    console.log(`Utilisateur créé pour ${result.user.email}`)
  } finally {
    await postgresClient.end({ timeout: 5 })
  }
}

void main()
