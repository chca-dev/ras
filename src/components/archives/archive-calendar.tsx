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

type ArchiveCalendarProps = {
  year: number
  month: number
  occupiedDays: Array<{
    entryDate: string
    entryCount: number
  }>
}

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function ArchiveCalendar({
  year,
  month,
  occupiedDays,
}: ArchiveCalendarProps) {
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

          return (
            <div
              className="archive-calendar-day"
              data-outside-month={!belongsToMonth || undefined}
              data-has-entries={entryCount > 0 || undefined}
              key={dateKey}
              aria-label={format(date, 'EEEE d MMMM yyyy', { locale: fr })}
            >
              <time dateTime={dateKey}>{format(date, 'd')}</time>
              {entryCount > 0 ? (
                <span
                  className="archive-calendar-count"
                  aria-label={`${entryCount} ${entryCount > 1 ? 'entrées' : 'entrée'}`}
                >
                  {entryCount}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
