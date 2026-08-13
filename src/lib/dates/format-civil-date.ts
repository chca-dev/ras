const civilDateToUtc = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

export const formatCivilDate = (value: string) => {
  const date = civilDateToUtc(value)

  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const formatCivilMonth = (value: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(civilDateToUtc(value))
}

export const formatCivilWeekday = (value: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    weekday: 'long',
  }).format(civilDateToUtc(value))
}

export const formatCivilDayNumber = (value: string) => {
  return String(Number(value.slice(-2)))
}

export const formatCivilMonthName = (value: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    month: 'long',
  }).format(civilDateToUtc(value))
}

export const formatCivilYear = (value: string) => value.slice(0, 4)

export const formatCivilWeekdayShort = (value: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(civilDateToUtc(value))
}

export const getTodayInParis = () => {
  const parts = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find(({ type }) => type === 'year')?.value
  const month = parts.find(({ type }) => type === 'month')?.value
  const day = parts.find(({ type }) => type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Impossible de déterminer la date du jour')
  }

  return `${year}-${month}-${day}`
}
