import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { chatApi } from '../api'

export function BottomNav() {
  const [unread, setUnread] = useState(0)
  const { pathname } = useLocation()

  useEffect(() => {
    let alive = true

    const load = () => {
      chatApi
        .unreadCount()
        .then((count) => {
          if (alive) setUnread(count)
        })
        .catch(() => {})
    }

    load()
    const timer = window.setInterval(load, 4000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    chatApi
      .unreadCount()
      .then(setUnread)
      .catch(() => {})
  }, [pathname])

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-end justify-around border-t border-black/5 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 backdrop-blur">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-1 ${
            isActive ? 'text-black' : 'text-neutral-400'
          }`
        }
      >
        <span className="text-xl" aria-hidden>
          🏠
        </span>
        <span className="text-[11px]">首页</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-1 ${
            isActive ? 'text-black' : 'text-neutral-400'
          }`
        }
      >
        <span className="relative text-xl" aria-hidden>
          💬
          {unread > 0 && (
            <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </span>
        <span className="text-[11px]">消息</span>
      </NavLink>

      <NavLink to="/publish" className="flex flex-1 flex-col items-center gap-0.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-2xl font-bold leading-none text-black shadow-md shadow-brand/40">
          ＋
        </span>
        <span className="text-[11px] text-neutral-500">发布</span>
      </NavLink>

      <NavLink
        to="/mine"
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-0.5 py-1 ${
            isActive ? 'text-black' : 'text-neutral-400'
          }`
        }
      >
        <span className="text-xl" aria-hidden>
          👤
        </span>
        <span className="text-[11px]">我的</span>
      </NavLink>
    </nav>
  )
}
