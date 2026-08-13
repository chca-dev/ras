import { cn } from '@/lib/utils'

export const LeafMark = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
    <path d='M20 4C11 4 4 9.5 4 17c0 1.2.2 2.3.6 3.4C8 13 13 10 20 9' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M4.6 20.4C6.5 15 10 12 15 10.5' stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
  </svg>
)

export const SunMark = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
    <circle cx='12' cy='12' r='4.2' stroke='currentColor' strokeWidth='1.4' />
    {[...Array(8)].map((_, index) => {
      const angle = (index * Math.PI) / 4
      return <line key={index} x1={12 + Math.cos(angle) * 7} y1={12 + Math.sin(angle) * 7} x2={12 + Math.cos(angle) * 9.2} y2={12 + Math.sin(angle) * 9.2} stroke='currentColor' strokeWidth='1.4' strokeLinecap='round' />
    })}
  </svg>
)

export const MoonMark = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
    <path d='M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z' stroke='currentColor' strokeWidth='1.4' strokeLinejoin='round' />
  </svg>
)

export const TimeMark = ({ hour, className }: { hour: number; className?: string }) => {
  if (hour >= 5 && hour < 12) return <SunMark className={className} />
  if (hour >= 12 && hour < 18) return <LeafMark className={className} />
  return <MoonMark className={className} />
}

export const DrawnSeparator = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center justify-center gap-3 text-border', className)} aria-hidden='true'>
    <span className='h-px w-10 bg-current opacity-60' />
    <svg viewBox='0 0 24 24' width='14' height='14' fill='none' className='text-primary/50'>
      <path d='M12 3c2 3.5 2 6.5 0 9-2-2.5-2-5.5 0-9ZM12 12c3.5 0 6 1 8 3-3 .5-6 0-8-3ZM12 12c-3.5 0-6 1-8 3 3 .5 6 0 8-3Z' stroke='currentColor' strokeWidth='1.2' strokeLinejoin='round' />
    </svg>
    <span className='h-px w-10 bg-current opacity-60' />
  </div>
)

export const OrganicBlob = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 200 200' className={className} aria-hidden='true'>
    <path fill='currentColor' d='M46.4 -58.7C58.9 -49.3 66.4 -33.1 69.7 -16.1C73 0.9 72.1 18.7 63.9 32.1C55.7 45.5 40.2 54.5 24 60.1C7.8 65.7 -9.1 67.9 -24.9 63.3C-40.7 58.7 -55.4 47.3 -63.2 32.4C-71 17.5 -71.9 -0.9 -66.6 -16.8C-61.3 -32.7 -49.8 -46.1 -36.3 -55.2C-22.8 -64.3 -7.4 -69.1 7.8 -70.3C23 -71.5 33.9 -68.1 46.4 -58.7Z' transform='translate(100 100)' />
  </svg>
)
