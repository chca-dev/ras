import { z } from 'zod'

const isValidCivilDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return false
  }

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export const updateEntrySchema = z.object({
  title: z.string().trim().max(160, 'Le titre est limité à 160 caractères.'),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date est invalide.')
    .refine(isValidCivilDate, 'La date est invalide.'),
  content: z.string().max(500_000, 'Le contenu est trop volumineux.'),
  revision: z.number().int().positive(),
})
