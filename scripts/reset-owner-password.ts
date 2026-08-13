import { existsSync } from 'node:fs'

import { and, eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import { z } from 'zod'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

const resetEnv = z
  .object({
    RESET_OWNER_PASSWORD: z.string().min(12).max(128),
  })
  .parse({
    RESET_OWNER_PASSWORD: process.env.RESET_OWNER_PASSWORD,
  })

delete process.env.RESET_OWNER_PASSWORD

async function main() {
  const [{ db, postgresClient }, { account, session, user }] =
    await Promise.all([
      import('../src/db/client'),
      import('../src/db/schema/auth'),
    ])

  try {
    const newPasswordHash = await hashPassword(resetEnv.RESET_OWNER_PASSWORD)

    await db.transaction(async (transaction) => {
      const users = await transaction.select({ id: user.id }).from(user).limit(2)

      if (users.length !== 1) {
        throw new Error(
          `Réinitialisation refusée : ${users.length} utilisateurs trouvés`,
        )
      }

      const ownerId = users[0].id
      const credentialAccounts = await transaction
        .select({ id: account.id })
        .from(account)
        .where(
          and(
            eq(account.userId, ownerId),
            eq(account.providerId, 'credential'),
          ),
        )
        .limit(2)

      if (credentialAccounts.length !== 1) {
        throw new Error(
          `Réinitialisation refusée : ${credentialAccounts.length} comptes credential trouvés`,
        )
      }

      await transaction
        .update(account)
        .set({
          password: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(account.id, credentialAccounts[0].id))

      await transaction.delete(session).where(eq(session.userId, ownerId))
    })

    console.log('Mot de passe propriétaire réinitialisé')
    console.log('Toutes les sessions existantes ont été révoquées')
  } finally {
    await postgresClient.end({ timeout: 5 })
  }
}

void main()
