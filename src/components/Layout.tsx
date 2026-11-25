import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/item/')

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-[#f4f4f5] shadow-[0_0_40px_rgba(0,0,0,0.08)]">
      <main className={`flex-1 ${hideNav ? '' : 'pb-20'}`}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
