import { X } from 'lucide-react'
import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeToggle } from '@/components/settings/theme-toggle'

export const SettingsPanel = ({ email }: { email: string }) => (
  <div className='fixed inset-0 z-40 flex items-end justify-center sm:items-start sm:justify-end sm:p-4'>
    <Link href='/journal' aria-label='Fermer' className='absolute inset-0 bg-foreground/20 backdrop-blur-[2px]' />
    <section className='relative w-full max-w-md rounded-t-2xl border border-border bg-popover p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:mt-12 sm:rounded-2xl sm:duration-200'>
      <header className='mb-4 flex items-center justify-between'>
        <h1 className='font-serif text-xl font-medium'>Réglages</h1>
        <Link href='/journal' aria-label='Fermer' className='rounded-full p-1 text-muted-foreground hover:bg-secondary'>
          <X className='h-5 w-5' />
        </Link>
      </header>

      <div className='flex flex-col divide-y divide-border/70'>
        <section className='flex items-center justify-between py-3' aria-labelledby='account-heading'>
          <div>
            <h2 id='account-heading' className='font-sans text-sm font-medium text-foreground'>Compte</h2>
            <p className='font-sans text-xs text-muted-foreground'>{email}</p>
          </div>
        </section>

        <section className='flex items-center justify-between py-3' aria-labelledby='install-heading'>
          <div>
            <h2 id='install-heading' className='font-sans text-sm font-medium text-foreground'>Installer RAS.</h2>
            <p className='font-sans text-xs text-muted-foreground'>Ajouter le journal à l’écran d’accueil.</p>
          </div>
        </section>

        <section className='flex items-center justify-between gap-4 py-3' aria-labelledby='theme-heading'>
          <div>
            <h2 id='theme-heading' className='font-sans text-sm font-medium text-foreground'>Mode nuit</h2>
            <p className='font-sans text-xs text-muted-foreground'>Charbon, orange et bleu pétrole.</p>
          </div>
          <ThemeToggle />
        </section>

        <section className='py-3' aria-labelledby='session-heading'>
          <h2 id='session-heading' className='sr-only'>Session</h2>
          <LogoutButton />
        </section>
      </div>

      <p className='mt-4 font-serif text-xs italic text-muted-foreground/70'>RAS. — journal personnel</p>
    </section>
  </div>
)
