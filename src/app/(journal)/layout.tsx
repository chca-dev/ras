import { AppShell } from '@/components/app-shell/app-shell'
import { requireSession } from '@/lib/auth/require-session'

const JournalLayout = async ({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) => {
  await requireSession()

  return <AppShell>{children}{modal}</AppShell>
}

export default JournalLayout
