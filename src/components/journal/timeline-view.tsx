import { ArrowUp, PenLine } from 'lucide-react'
import Link from 'next/link'

import { createEntryAction } from '@/app/(journal)/journal/actions'
import { DrawnSeparator, OrganicBlob, TimeMark } from '@/components/journal/decor'
import {
  formatCivilDayNumber,
  formatCivilMonth,
  formatCivilMonthName,
  formatCivilWeekdayShort,
  formatCivilYear,
} from '@/lib/dates/format-civil-date'

type TimelineEntry = {
  id: string
  title: string | null
  entryDate: string
  plainText: string
  createdAt: Date
}

type TimelineViewProps = {
  entries: TimelineEntry[]
  nextCursor: string | null
  cursor?: string
  today: string
}

const getEntryHour = (date: Date) => Number(new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  hour12: false,
}).format(date))

const formatEntryTime = (date: Date) => new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(date).replace(':', 'h')

export const TimelineView = ({ entries, nextCursor, cursor, today }: TimelineViewProps) => (
  <main>
    <div className='mb-8 flex items-end justify-between gap-4'>
      <div>
        <p className='font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground'>Aujourd&apos;hui</p>
        <h1 className='mt-1 font-serif text-4xl font-medium leading-none tracking-tight text-foreground sm:text-5xl'>
          {formatCivilMonthName(today)}
          <span className='ml-2 align-top font-sans text-base font-normal text-muted-foreground'>{formatCivilYear(today)}</span>
        </h1>
      </div>
      <Link href='/journal' className='inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground'>
        <ArrowUp className='h-3.5 w-3.5' aria-hidden='true' />
        Aujourd&apos;hui
      </Link>
    </div>

    {entries.length === 0 && !cursor ? (
      <section className='relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 text-center'>
        <div className='pointer-events-none absolute top-4 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-glow/20 blur-3xl' />
        <OrganicBlob className='pointer-events-none absolute -left-10 bottom-0 h-48 w-48 text-primary/[0.04]' />
        <span className='relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/8 text-primary glow-soft'>
          <span className='h-7 w-7 rounded-full border border-current' />
        </span>
        <h2 className='relative max-w-md font-serif text-2xl font-medium leading-snug text-foreground text-balance sm:text-3xl'>
          Il ne s&apos;est sûrement rien passé.<br />
          <span className='text-muted-foreground'>À part tout le reste.</span>
        </h2>
        <DrawnSeparator className='my-7' />
        <p className='relative mb-7 max-w-xs font-sans text-sm leading-relaxed text-muted-foreground'>Ton journal est encore vierge. La première page est souvent la plus facile.</p>
        <form action={createEntryAction}>
          <button type='submit' className='relative inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition hover:brightness-110 active:scale-[0.99]'>
            <PenLine className='h-4 w-4' aria-hidden='true' />
            Écrire ma première entrée
          </button>
        </form>
      </section>
    ) : (
      <>
        <ol className='flex flex-col'>
          {entries.map((entry, index) => {
            const previous = entries[index - 1]
            const startsMonth = index > 0 && previous.entryDate.slice(0, 7) !== entry.entryDate.slice(0, 7)
            const excerpt = entry.plainText.trim().replace(/\s+/g, ' ')

            return (
              <li key={entry.id}>
                {startsMonth ? (
                  <div className='my-6'>
                    <DrawnSeparator />
                    <p className='mt-4 text-center font-serif text-sm italic text-muted-foreground'>{formatCivilMonth(entry.entryDate)}</p>
                  </div>
                ) : null}
                <Link href={`/journal/${entry.id}`} className='group block w-full text-left'>
                  <article className='grid grid-cols-[3.25rem_1fr] gap-4 sm:grid-cols-[4rem_1fr] sm:gap-6'>
                    <time dateTime={entry.entryDate} className='flex flex-col items-center pt-1'>
                      <span className='font-sans text-[0.65rem] uppercase tracking-wide text-muted-foreground'>{formatCivilWeekdayShort(entry.entryDate)}</span>
                      <span className='font-serif text-2xl font-medium leading-none text-foreground sm:text-3xl'>{formatCivilDayNumber(entry.entryDate)}</span>
                      <TimeMark hour={getEntryHour(entry.createdAt)} className='mt-2 h-4 w-4 text-primary/60' />
                    </time>
                    <div className='min-w-0'>
                      {entry.title ? <h2 className='font-serif text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-primary sm:text-2xl text-balance'>{entry.title}</h2> : null}
                      {excerpt ? <p className={`mt-1.5 font-sans text-[0.95rem] leading-relaxed text-muted-foreground ${entry.title ? 'line-clamp-2' : 'line-clamp-3'}`}>{excerpt}</p> : null}
                      <div className='mt-2.5 flex items-center gap-2 font-sans text-xs text-muted-foreground/80'><span>{formatEntryTime(entry.createdAt)}</span></div>
                    </div>
                  </article>
                </Link>
                {index < entries.length - 1 && !startsMonth ? <div className='my-7 h-px bg-border/70' /> : null}
              </li>
            )
          })}
        </ol>

        <div className='mt-12 flex flex-col items-center gap-4 text-center'>
          <DrawnSeparator />
          <p className='font-serif text-sm italic text-muted-foreground/80'>Le reste est encore à écrire.</p>
          <div className='flex gap-3'>
            <form action={createEntryAction}>
              <button type='submit' className='inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition hover:brightness-110'>
                <PenLine className='h-4 w-4' aria-hidden='true' /> Écrire
              </button>
            </form>
            <Link href='/archives' className='rounded-full border border-border px-4 py-2 font-sans text-sm text-muted-foreground transition hover:text-foreground'>Parcourir les archives</Link>
          </div>
        </div>

        <nav className='mt-10 flex justify-between gap-4 font-sans text-sm text-muted-foreground' aria-label='Pagination du journal'>
          {cursor ? <Link href='/journal'>Entrées récentes</Link> : <span />}
          {nextCursor ? <Link href={`/journal?cursor=${encodeURIComponent(nextCursor)}`}>Entrées précédentes</Link> : null}
        </nav>
      </>
    )}
  </main>
)
