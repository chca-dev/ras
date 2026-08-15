import { Origami } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { OrganicBlob } from '@/components/journal/decor'
import { auth } from '@/lib/auth'

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/journal')
  }

  return (
    <main className='relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12 paper-texture'>
      <div className='pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-glow/25 blur-3xl' />
      <OrganicBlob className='pointer-events-none absolute -right-16 bottom-8 h-56 w-56 text-primary/[0.05]' />

      <section className='relative flex w-full max-w-sm flex-col items-center' aria-labelledby='login-title'>
        <div className='mb-8 flex flex-col items-center text-center'>
          <span className='mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary glow-soft' aria-hidden='true'>
            <Origami className='h-6 w-6' strokeWidth={1.5} />
          </span>
          <p className='font-serif text-4xl font-medium tracking-tight text-foreground'>RAS.</p>
          <h1 id='login-title' className='mt-3 max-w-[15rem] font-sans text-sm font-normal leading-relaxed text-muted-foreground'>Bon. On en était où&nbsp;?</h1>
        </div>

        <LoginForm />

        <p className='mt-10 font-serif text-sm italic text-muted-foreground/80'>Rien à signaler. Pour l’instant.</p>
      </section>
    </main>
  )
}

export default LoginPage
