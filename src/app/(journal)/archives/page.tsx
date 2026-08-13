import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { ArchiveCalendar } from '@/components/archives/archive-calendar'
import { requireSession } from '@/lib/auth/require-session'
import {
  listArchiveMonthDays,
  listArchiveYears,
} from '@/lib/entries/archive-dal'

function parseInteger(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null
  }

  return Number(value)
}

function getCurrentParisMonth() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())

  return {
    year: Number(parts.find(({ type }) => type === 'year')?.value),
    month: Number(parts.find(({ type }) => type === 'month')?.value),
  }
}

function getAdjacentMonth(year: number, month: number, offset: -1 | 1) {
  if (month === 1 && offset === -1) {
    return { year: year - 1, month: 12 }
  }

  if (month === 12 && offset === 1) {
    return { year: year + 1, month: 1 }
  }

  return { year, month: month + offset }
}

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string | string[]
    month?: string | string[]
  }>
}) {
  const [params, session] = await Promise.all([searchParams, requireSession()])
  const years = await listArchiveYears(session.user.id)
  const currentMonth = getCurrentParisMonth()
  const requestedYear = parseInteger(params.year)
  const requestedMonth = parseInteger(params.month)
  const selectedYear =
    requestedYear && years.some(({ year }) => year === requestedYear)
      ? requestedYear
      : (years[0]?.year ?? currentMonth.year)
  const selectedMonth =
    requestedMonth && requestedMonth >= 1 && requestedMonth <= 12
      ? requestedMonth
      : selectedYear === currentMonth.year
        ? currentMonth.month
        : 12
  const occupiedDays = await listArchiveMonthDays(
    session.user.id,
    selectedYear,
    selectedMonth,
  )
  const previousMonth = getAdjacentMonth(selectedYear, selectedMonth, -1)
  const nextMonth = getAdjacentMonth(selectedYear, selectedMonth, 1)
  const monthLabel = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(selectedYear, selectedMonth - 1, 1))

  return (
    <main className="shell-page archives-page">
      <header className="shell-page-heading">
        <p className="shell-page-kicker">Retrouver une entrée</p>
        <h1>Archives</h1>
      </header>

      <section className="archives-browser">
        <form className="archives-year-picker">
          <label htmlFor="archives-year">Année</label>
          <select
            id="archives-year"
            name="year"
            defaultValue={selectedYear}
            disabled={years.length === 0}
          >
            {years.length > 0 ? (
              years.map(({ year, entryCount }) => (
                <option value={year} key={year}>
                  {year} · {entryCount} {entryCount > 1 ? 'entrées' : 'entrée'}
                </option>
              ))
            ) : (
              <option value={selectedYear}>{selectedYear}</option>
            )}
          </select>
          <input type="hidden" name="month" value={selectedMonth} />
          <button type="submit" disabled={years.length === 0}>
            Afficher
          </button>
        </form>

        <div className="archives-month-heading">
          <Link
            href={`/archives?year=${previousMonth.year}&month=${previousMonth.month}`}
            aria-label="Mois précédent"
          >
            <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.75} />
          </Link>
          <h2>{monthLabel}</h2>
          <Link
            href={`/archives?year=${nextMonth.year}&month=${nextMonth.month}`}
            aria-label="Mois suivant"
          >
            <ChevronRight aria-hidden="true" size={20} strokeWidth={1.75} />
          </Link>
        </div>

        <ArchiveCalendar
          year={selectedYear}
          month={selectedMonth}
          occupiedDays={occupiedDays}
        />

        {occupiedDays.length === 0 ? (
          <p className="archives-month-empty">Rien pour ce mois-ci.</p>
        ) : null}
      </section>
    </main>
  )
}
