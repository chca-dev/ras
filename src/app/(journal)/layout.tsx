import { requireSession } from '@/lib/auth/require-session'

export default async function JournalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireSession()

  return children
}
