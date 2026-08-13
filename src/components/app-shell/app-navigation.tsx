'use client'

import { Archive, BookOpen, PenLine, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFormStatus } from 'react-dom'

import { createEntryAction } from '@/app/(journal)/journal/actions'

const navigationItems = [
  {
    href: '/journal',
    label: 'Journal',
    icon: BookOpen,
  },
  {
    href: '/archives',
    label: 'Archives',
    icon: Archive,
  },
  {
    href: '/settings',
    label: 'Réglages',
    icon: Settings,
  },
]

function WriteButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="app-navigation-write"
      type="submit"
      disabled={pending}
    >
      <PenLine aria-hidden="true" size={19} strokeWidth={1.75} />
      <span>{pending ? 'Création…' : 'Écrire'}</span>
    </button>
  )
}

export function AppNavigation() {
  const pathname = usePathname()

  return (
    <aside className="app-navigation" aria-label="Navigation principale">
      <Link className="app-navigation-brand" href="/journal">
        RAS.
      </Link>

      <nav className="app-navigation-links">
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              className="app-navigation-link"
              href={href}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <form className="app-navigation-write-form" action={createEntryAction}>
        <WriteButton />
      </form>
    </aside>
  )
}
