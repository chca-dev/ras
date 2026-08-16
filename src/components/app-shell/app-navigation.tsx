'use client'

import {
  CalendarDays,
  Origami,
  PenLine,
  ScrollText,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFormStatus } from 'react-dom'

import { createEntryAction } from '@/app/(journal)/journal/actions'

const navigationItems = [
  {
    href: '/journal',
    label: 'Chronologie',
    icon: ScrollText,
  },
  {
    href: '/archives',
    label: 'Archives',
    icon: CalendarDays,
  },
]

const WriteButton = ({ compact = false }: { compact?: boolean }) => {
  const { pending } = useFormStatus()

  return (
    <button
      className={compact
        ? '-mt-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-95 glow-soft'
        : 'ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition hover:brightness-110'}
      type="submit"
      disabled={pending}
    >
      <PenLine aria-hidden='true' className={compact ? 'h-6 w-6' : 'h-4 w-4'} />
      <span className={compact ? 'sr-only' : undefined}>
        {pending ? 'Création…' : 'Écrire'}
      </span>
    </button>
  )
}

export const AppNavigation = () => {
  const pathname = usePathname()
  const settingsIsActive = pathname.startsWith('/settings')

  return (
    <header className='sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md'>
      <div className='mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6'>
        <Link className='flex items-center gap-2 text-foreground transition hover:opacity-80' href='/journal'>
          <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/8 text-primary glow-soft' aria-hidden='true'>
            <Origami className='h-4 w-4' strokeWidth={1.5} />
          </span>
          <span className='font-serif text-lg font-medium tracking-tight'>RAS.</span>
        </Link>

        <div className='flex items-center gap-1'>
        <nav className='mr-1 hidden items-center gap-1 md:flex' aria-label='Navigation principale'>
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                className='inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-sans text-sm text-muted-foreground transition hover:text-foreground aria-[current=page]:text-foreground [&[aria-current=page]_svg]:text-primary'
                href={href}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon aria-hidden="true" size={19} strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            )
          })}

          <form action={createEntryAction}>
            <WriteButton />
          </form>

          <Link
            className='inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-foreground'
            href="/settings"
            aria-current={settingsIsActive ? 'page' : undefined}
            aria-label="Réglages"
          >
            <Settings aria-hidden="true" size={21} strokeWidth={1.75} />
          </Link>
        </nav>
        <Link
          className='hidden'
          href="/settings"
          aria-current={settingsIsActive ? 'page' : undefined}
          aria-label="Réglages"
        >
          <Settings aria-hidden="true" size={22} strokeWidth={1.75} />
        </Link>
        </div>
      </div>

      <nav className='fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden' aria-label='Navigation principale'>
        <div className='mx-auto grid max-w-md grid-cols-5 items-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2'>
          <div className='col-span-2 flex items-center justify-around gap-0.5'>
            {navigationItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                className='flex flex-col items-center gap-1 px-2 py-1 font-sans text-[0.65rem] text-muted-foreground aria-[current=page]:text-foreground [&[aria-current=page]_svg]:text-primary'
                href={href}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon aria-hidden='true' size={21} strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <form className='col-start-3 grid justify-items-center' action={createEntryAction}>
            <WriteButton compact />
          </form>

          <Link
            className='col-start-5 flex flex-col items-center gap-1 justify-self-center px-2 py-1 font-sans text-[0.65rem] text-muted-foreground aria-[current=page]:text-foreground [&[aria-current=page]_svg]:text-primary'
            href='/settings'
            aria-current={settingsIsActive ? 'page' : undefined}
            aria-label='Réglages'
          >
            <Settings aria-hidden='true' size={21} strokeWidth={1.75} />
            <span>Réglages</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
