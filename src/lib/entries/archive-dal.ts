import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm'

import { db } from '@/db/client'
import { entries } from '@/db/schema'

function formatMonthStart(year: number, month: number) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`
}

function getMonthRange(year: number, month: number) {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError('L’année est invalide')
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Le mois est invalide')
  }

  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1

  return {
    start: formatMonthStart(year, month),
    end: formatMonthStart(nextYear, nextMonth),
  }
}

export async function listArchiveYears(ownerId: string) {
  const year = sql<number>`extract(year from ${entries.entryDate})::int`

  return db
    .select({
      year,
      entryCount: sql<number>`count(*)::int`,
    })
    .from(entries)
    .where(eq(entries.ownerId, ownerId))
    .groupBy(year)
    .orderBy(desc(year))
}

export async function listArchiveMonthDays(
  ownerId: string,
  year: number,
  month: number,
) {
  const range = getMonthRange(year, month)

  return db
    .select({
      entryDate: entries.entryDate,
      entryCount: sql<number>`count(*)::int`,
    })
    .from(entries)
    .where(
      and(
        eq(entries.ownerId, ownerId),
        gte(entries.entryDate, range.start),
        lt(entries.entryDate, range.end),
      ),
    )
    .groupBy(entries.entryDate)
    .orderBy(asc(entries.entryDate))
}
