import { AppNavigation } from '@/components/app-shell/app-navigation'

export const AppShell = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className='relative flex min-h-dvh flex-col bg-background paper-texture'>
      <AppNavigation />
      <div className='mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-16'>{children}</div>
    </div>
  )
}
