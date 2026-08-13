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
  }>
}

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

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
  const entryCounts = new Map(
    occupiedDays.map(({ entryDate, entryCount }) => [entryDate, entryCount]),
  )

  return (
    <div className="archive-calendar">
      <div className="archive-calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="archive-calendar-grid">
        {calendarDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const entryCount = entryCounts.get(dateKey) ?? 0
          const belongsToMonth = isSameMonth(date, monthDate)
          const dayNumber = Number(format(date, 'd'))
          const isSelected = belongsToMonth && selectedDay === dayNumber
          const fullDateLabel = format(date, 'EEEE d MMMM yyyy', {
            locale: fr,
          })

          return (
            <div
              className="archive-calendar-day"
              data-outside-month={!belongsToMonth || undefined}
              data-has-entries={entryCount > 0 || undefined}
              data-selected={isSelected || undefined}
              key={dateKey}
            >
              {belongsToMonth && entryCount > 0 ? (
                <Link
                  href={`/archives?year=${year}&month=${month}&day=${dayNumber}`}
                  aria-current={isSelected ? 'date' : undefined}
                  aria-label={`${fullDateLabel}, ${entryCount} ${entryCount > 1 ? 'entrées' : 'entrée'}`}
                >
                  <time dateTime={dateKey}>{dayNumber}</time>
                  <span className="archive-calendar-count">{entryCount}</span>
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
