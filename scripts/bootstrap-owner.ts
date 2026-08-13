import { count } from 'drizzle-orm'
import { z } from 'zod'

const bootstrapEnv = z
  .object({
    BOOTSTRAP_EMAIL: z.string().trim().toLowerCase().pipe(z.email()),
    BOOTSTRAP_PASSWORD: z.string().min(12).max(128),
  })
  .parse({
    BOOTSTRAP_EMAIL: process.env.BOOTSTRAP_EMAIL,
    BOOTSTRAP_PASSWORD: process.env.BOOTSTRAP_PASSWORD,
  })

process.env.AUTH_BOOTSTRAP_ENABLED = 'true'

async function main() {
  const [{ auth }, { db, postgresClient }, { user }] = await Promise.all([
    import('../src/lib/auth'),
    import('../src/db/client'),
    import('../src/db/schema/auth'),
  ])

  try {
    const [before] = await db.select({ value: count() }).from(user)

    if (before.value !== 0) {
      throw new Error('Le compte propriétaire existe déjà')
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: 'Propriétaire',
        email: bootstrapEnv.BOOTSTRAP_EMAIL,
        password: bootstrapEnv.BOOTSTRAP_PASSWORD,
      },
    })

    const [after] = await db.select({ value: count() }).from(user)

    if (
      result.user.email !== bootstrapEnv.BOOTSTRAP_EMAIL ||
      after.value !== 1
    ) {
      throw new Error('Better Auth n’a pas confirmé la création du propriétaire')
    }

    console.log(`Compte propriétaire créé pour ${result.user.email}`)
  } finally {
    await postgresClient.end({ timeout: 5 })
  }
}

void main()
