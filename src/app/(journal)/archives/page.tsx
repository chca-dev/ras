import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { ArchiveCalendar } from '@/components/archives/archive-calendar'
import { requireSession } from '@/lib/auth/require-session'
import {
  formatCivilDate,
  formatCivilDayNumber,
  formatCivilWeekday,
} from '@/lib/dates/format-civil-date'
import {
  listArchiveEntries,
  listArchiveMonthDays,
  listArchiveYears,
} from '@/lib/entries/archive-dal'

const parseInteger = (value: string | string[] | undefined) => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return null
  }

  return Number(value)
}

const getCurrentParisMonth = () => {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())

  return {
    year: Number(parts.find(({ type }) => type === 'year')?.value),
    month: Number(parts.find(({ type }) => type === 'month')?.value),
    day: Number(parts.find(({ type }) => type === 'day')?.value),
  }
}

const isValidCivilDay = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    Number.isInteger(day) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const getAdjacentMonth = (year: number, month: number, offset: -1 | 1) => {
  if (month === 1 && offset === -1) {
    return { year: year - 1, month: 12 }
  }

  if (month === 12 && offset === 1) {
    return { year: year + 1, month: 1 }
  }

  return { year, month: month + offset }
}

const ArchivesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string | string[]
    month?: string | string[]
    day?: string | string[]
  }>
}) => {
  const [params, session] = await Promise.all([searchParams, requireSession()])
  const years = await listArchiveYears(session.user.id)
  const currentMonth = getCurrentParisMonth()
  const requestedYear = parseInteger(params.year)
  const requestedMonth = parseInteger(params.month)
  const requestedDay = parseInteger(params.day)
  const selectedYear =
    requestedYear && requestedYear >= 1 && requestedYear <= 9999
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
  const selectedDay =
    requestedDay && isValidCivilDay(selectedYear, selectedMonth, requestedDay)
      ? requestedDay
      : null
  const archiveEntries = await listArchiveEntries(
    session.user.id,
    selectedYear,
    selectedMonth,
    selectedDay ?? undefined,
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
        <div className="archives-toolbar">
          <form className="archives-year-picker">
            <label htmlFor="archives-year">Année</label>
            <select
              id="archives-year"
              name="year"
              defaultValue={selectedYear}
              disabled={years.length === 0}
            >
              {years.length > 0 ? (
                <>
                  {!years.some(({ year }) => year === selectedYear) ? (
                    <option value={selectedYear}>{selectedYear} · 0 entrée</option>
                  ) : null}
                  {years.map(({ year, entryCount }) => (
                    <option value={year} key={year}>
                      {year} · {entryCount}{' '}
                      {entryCount > 1 ? 'entrées' : 'entrée'}
                    </option>
                  ))}
                </>
              ) : (
                <option value={selectedYear}>{selectedYear}</option>
              )}
            </select>
            <input type="hidden" name="month" value={selectedMonth} />
            <button type="submit" disabled={years.length === 0}>
              Afficher
            </button>
          </form>

          <Link
            className="archives-today-link"
            href={`/archives?year=${currentMonth.year}&month=${currentMonth.month}&day=${currentMonth.day}`}
          >
            Aujourd’hui
          </Link>
        </div>

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
          selectedDay={selectedDay}
          occupiedDays={occupiedDays}
        />

        {selectedDay && archiveEntries.length === 0 ? (
          <section className="archives-results">
            <header className="archives-results-heading">
              <h3>
                {formatCivilDate(
                  `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
                )}
              </h3>
              <Link href={`/archives?year=${selectedYear}&month=${selectedMonth}`}>
                Tout le mois
              </Link>
            </header>
            <p className="archives-month-empty">Rien pour ce jour-ci.</p>
          </section>
        ) : occupiedDays.length === 0 ? (
          <p className="archives-month-empty">Rien pour ce mois-ci.</p>
        ) : (
          <section className="archives-results">
            <header className="archives-results-heading">
              <h3>
                {selectedDay
                  ? formatCivilDate(
                      `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
                    )
                  : `Entrées de ${monthLabel}`}
              </h3>
              {selectedDay ? (
                <Link href={`/archives?year=${selectedYear}&month=${selectedMonth}`}>
                  Tout le mois
                </Link>
              ) : null}
            </header>

            <div className="journal-month-entries">
              {archiveEntries.map((entry) => {
                const excerpt = entry.plainText.trim().replace(/\s+/g, ' ')

                return (
                  <article className="journal-entry-preview" key={entry.id}>
                    <Link href={`/journal/${entry.id}`}>
                      <time dateTime={entry.entryDate}>
                        <span className="journal-entry-day">
                          {formatCivilDayNumber(entry.entryDate)}
                        </span>
                        <span className="journal-entry-weekday">
                          {formatCivilWeekday(entry.entryDate)}
                        </span>
                      </time>

                      <div className="journal-entry-summary">
                        {entry.title ? <h3>{entry.title}</h3> : null}
                        <p>
                          {excerpt
                            ? `${excerpt.slice(0, 220)}${excerpt.length > 220 ? '…' : ''}`
                            : 'Rien à signaler, donc.'}
                        </p>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default ArchivesPage
