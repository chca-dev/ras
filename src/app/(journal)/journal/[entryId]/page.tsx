import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DeleteEntryButton } from '@/components/entries/delete-entry-button'
import { RichTextRenderer } from '@/components/entries/rich-text-renderer'
import { DrawnSeparator, TimeMark } from '@/components/journal/decor'
import { requireSession } from '@/lib/auth/require-session'
import {
  formatCivilDate,
  formatCivilDayNumber,
  formatCivilMonthName,
  formatCivilWeekday,
  formatCivilYear,
} from '@/lib/dates/format-civil-date'
import { getEntryById } from '@/lib/entries/dal'
import { createDocumentFromPlainText, parseTiptapDocument } from '@/lib/tiptap/document'

const formatEntryTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(':', 'h')
}

const EntryPage = async ({
  params,
}: {
  params: Promise<{ entryId: string }>
}) => {
  const [{ entryId }, session] = await Promise.all([
    params,
    requireSession(),
  ])
  const entry = await getEntryById(session.user.id, entryId)

  if (!entry) {
    notFound()
  }

  const document = parseTiptapDocument(entry.content) ?? createDocumentFromPlainText(entry.plainText)
  const hour = Number(new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    hour12: false,
  }).format(entry.createdAt))

  return (
    <main className='mx-auto max-w-[42rem]'>
      <nav className='-mt-2 mb-6 flex items-center justify-between' aria-label='Actions de l’entrée'>
        <Link href='/journal' className='inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 font-sans text-sm text-muted-foreground transition hover:text-foreground'>
          <ArrowLeft aria-hidden='true' className='h-4 w-4' />
          Journal
        </Link>
        <div className='flex items-center gap-1'>
          <Link href={`/journal/${entry.id}/edit`} className='inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-sans text-sm text-foreground transition hover:border-primary/30'>
            <Pencil aria-hidden='true' className='h-3.5 w-3.5' /> Modifier
          </Link>
          <DeleteEntryButton entryId={entry.id} compact />
        </div>
      </nav>

      <article>
        <header className='mb-8'>
          <time dateTime={entry.entryDate}>
            <span className='flex items-center gap-2 text-primary'>
              <TimeMark hour={hour} className='h-4 w-4' />
              <span className='font-sans text-xs uppercase tracking-[0.18em]'>
              {formatCivilWeekday(entry.entryDate)} · {formatEntryTime(entry.createdAt)}
              </span>
            </span>
            <span className='mt-2 block font-serif text-3xl font-medium leading-none tracking-tight text-foreground sm:text-4xl'>
              {formatCivilDayNumber(entry.entryDate)}{' '}
              {formatCivilMonthName(entry.entryDate)}
              <span className='ml-2 align-top font-sans text-base font-normal text-muted-foreground'>{formatCivilYear(entry.entryDate)}</span>
            </span>
          </time>
          {entry.title ? <h1 className='mt-5 font-serif text-3xl font-medium leading-tight text-foreground text-balance sm:text-4xl'>{entry.title}</h1> : null}
        </header>

        {entry.plainText ? (
          <RichTextRenderer content={document.content} />
        ) : (
          <p className='font-serif text-[1.15rem] italic text-muted-foreground'>Rien à signaler, donc.</p>
        )}

        <footer className='mb-4 mt-12 flex flex-col items-center gap-4'>
          <DrawnSeparator />
          <p className='font-serif text-sm italic text-muted-foreground/80'>Fin de la page — {formatCivilDate(entry.entryDate)}.</p>
        </footer>
      </article>
    </main>
  )
}

export default EntryPage
