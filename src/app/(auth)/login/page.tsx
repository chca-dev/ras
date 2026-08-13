import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/journal')
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-heading">
          <p className="login-brand">RAS.</p>
          <span className="login-rule" aria-hidden="true" />
          <h1 id="login-title">Bon. On en était où&nbsp;?</h1>
        </div>

        <LoginForm />
      </section>
    </main>
  )
}
