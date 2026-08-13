import { AppNavigation } from '@/components/app-shell/app-navigation'

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="app-shell">
      <AppNavigation />
      <div className="app-shell-content">{children}</div>
    </div>
  )
}
