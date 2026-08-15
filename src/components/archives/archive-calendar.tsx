import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

type ArchiveCalendarProps = {
  year: number
  month: number
  selectedDay: number | null
  occupiedDays: Array<{
    entryDate: string
    entryCount: number
    coverMediaId: string | null
  }>
}

const weekdayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export const ArchiveCalendar = ({
  year,
  month,
  selectedDay,
  occupiedDays,
}: ArchiveCalendarProps) => {
  const monthDate = new Date(year, month - 1, 1)
  const calendarStart = startOfWeek(startOfMonth(monthDate), {
    weekStartsOn: 1,
  })
  const calendarEnd = endOfWeek(endOfMonth(monthDate), {
    weekStartsOn: 1,
  })
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })
  const entryDetails = new Map(
    occupiedDays.map(({ entryDate, entryCount, coverMediaId }) => [
      entryDate,
      { entryCount, coverMediaId },
    ]),
  )

  return (
    <div>
      <div className='mb-2 grid grid-cols-7 gap-1' aria-hidden='true'>
        {weekdayLabels.map((label, index) => (
          <span className='text-center font-sans text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground' key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const { entryCount, coverMediaId } = entryDetails.get(dateKey) ?? {
            entryCount: 0,
            coverMediaId: null,
          }
          const belongsToMonth = isSameMonth(date, monthDate)
          const dayNumber = Number(format(date, 'd'))
          const isSelected = belongsToMonth && selectedDay === dayNumber
          const fullDateLabel = format(date, 'EEEE d MMMM yyyy', {
            locale: fr,
          })

          return (
            <div
              className='relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg font-sans text-sm text-muted-foreground/50 data-[has-entries]:text-foreground data-[selected]:ring-2 data-[selected]:ring-primary'
              data-outside-month={!belongsToMonth || undefined}
              data-has-entries={entryCount > 0 || undefined}
              data-selected={isSelected || undefined}
              key={dateKey}
            >
              {!belongsToMonth ? null : entryCount > 0 ? (
                <Link
                  href={`/archives?year=${year}&month=${month}&day=${dayNumber}`}
                  aria-current={isSelected ? 'date' : undefined}
                  aria-label={`${fullDateLabel}, ${entryCount} ${entryCount > 1 ? 'entrées' : 'entrée'}`}
                  className='absolute inset-0 flex flex-col items-center justify-center rounded-lg transition hover:ring-2 hover:ring-primary/40'
                >
                  {coverMediaId ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/media/${coverMediaId}/thumb`}
                        alt=''
                        loading='lazy'
                        className='absolute inset-0 h-full w-full object-cover opacity-90'
                      />
                      <span className='absolute inset-0 bg-foreground/25' />
                    </>
                  ) : null}
                  <time className={coverMediaId ? 'relative font-medium text-background' : undefined} dateTime={dateKey}>{dayNumber}</time>
                  {!coverMediaId ? <span className='absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-primary' /> : null}
                </Link>
              ) : (
                <time dateTime={dateKey} aria-label={fullDateLabel}>
                  {dayNumber}
                </time>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
