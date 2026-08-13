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
    day: 'numeric',
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
    <main>
      <header className='mb-6 flex items-end justify-between gap-4'>
        <div>
          <p className='font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground'>Archives</p>
          <h1 className='mt-1 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl'>Retrouver un jour</h1>
        </div>
        <span className='rounded-full bg-primary px-3 py-1 font-sans text-sm text-primary-foreground'>{selectedYear}</span>
      </header>

      <section>
        <div className='rounded-2xl border border-border bg-card p-4 sm:p-5'>
          <div className='mb-4 flex items-center justify-between'>
            <Link
              href={`/archives?year=${previousMonth.year}&month=${previousMonth.month}`}
              aria-label='Mois précédent'
              className='inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground'
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.75} />
            </Link>
            <h2 className='font-serif text-xl font-medium capitalize text-foreground'>{monthLabel}</h2>
            <Link
              href={`/archives?year=${nextMonth.year}&month=${nextMonth.month}`}
              aria-label='Mois suivant'
              className='inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground'
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

          <footer className='mt-4 flex items-center justify-between border-t border-border/70 pt-3'>
            <form className='flex items-center gap-2'>
              <label className='sr-only' htmlFor='archives-year'>Année</label>
              <select
                id="archives-year"
                name="year"
                defaultValue={selectedYear}
                disabled={years.length === 0}
                className='rounded-full border border-border bg-card px-3 py-1 font-sans text-xs text-muted-foreground'
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
              <button className='rounded-full bg-primary px-3 py-1 font-sans text-xs text-primary-foreground disabled:opacity-50' type='submit' disabled={years.length === 0}>
                Afficher
              </button>
            </form>

            <Link
              className='rounded-full border border-border px-3 py-1 font-sans text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground'
              href={`/archives?year=${currentMonth.year}&month=${currentMonth.month}&day=${currentMonth.day}`}
            >
              Aujourd’hui
            </Link>
          </footer>
        </div>

        {selectedDay && archiveEntries.length === 0 ? (
          <section className='mt-8'>
            <header className='mb-4 flex items-center justify-between'>
              <h3>
                {formatCivilDate(
                  `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
                )}
              </h3>
              <Link href={`/archives?year=${selectedYear}&month=${selectedMonth}`}>
                Tout le mois
              </Link>
            </header>
            <p className='rounded-xl border border-dashed border-border py-10 text-center font-sans text-sm text-muted-foreground'>Rien pour ce jour-ci.</p>
          </section>
        ) : occupiedDays.length === 0 ? (
          <p className='mt-8 rounded-xl border border-dashed border-border py-10 text-center font-sans text-sm text-muted-foreground'>Rien pour ce mois-ci.</p>
        ) : (
          <section className='mt-8'>
            <header className='mb-4 flex items-center justify-between'>
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

            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
              {archiveEntries.map((entry) => {
                const excerpt = entry.plainText.trim().replace(/\s+/g, ' ')

                return (
                  <li key={entry.id}>
                    <Link href={`/journal/${entry.id}`} className='group flex aspect-square flex-col justify-between rounded-xl border border-border bg-secondary/50 p-3 transition hover:border-primary/30'>
                      <span className='font-serif text-2xl font-medium text-foreground'>{formatCivilDayNumber(entry.entryDate)}</span>
                      <span className='line-clamp-3 font-sans text-xs leading-relaxed text-muted-foreground'>{entry.title ?? excerpt ?? formatCivilWeekday(entry.entryDate)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </section>
    </main>
  )
}

export default ArchivesPage
