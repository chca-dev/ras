function civilDateToUtc(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

export function formatCivilDate(value: string) {
  const date = civilDateToUtc(value)

  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatCivilMonth(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(civilDateToUtc(value))
}

export function formatCivilWeekday(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    weekday: 'long',
  }).format(civilDateToUtc(value))
}

export function formatCivilDayNumber(value: string) {
  return String(Number(value.slice(-2)))
}
