import { AppShell } from '@/components/app-shell/app-shell'
import { requireSession } from '@/lib/auth/require-session'

export default async function JournalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireSession()

  return <AppShell>{children}</AppShell>
}
