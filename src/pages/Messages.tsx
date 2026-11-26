import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatApi } from '../api'
import { useItems } from '../store/ItemsContext'
import type { Conversation } from '../types'
import { formatListTime } from '../utils'

export function Messages() {
  const { items } = useItems()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function load() {
      const list = await chatApi.conversations()
      if (!alive) return
      setConversations(list)

      const entries = await Promise.all(
        list.map(async (conversation) => {
          const messages = await chatApi.messages(conversation.id)
          return [conversation.id, messages[messages.length - 1]?.text ?? ''] as const
        }),
      )
      if (!alive) return
      setLastMessages(Object.fromEntries(entries))
      setLoading(false)
    }

    void load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div>
      <header className="bg-gradient-to-b from-brand to-[#ffe95c] px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-lg font-extrabold">消息</h1>
        <p className="text-[11px] text-black/50">买家和卖家的对话都在这里</p>
      </header>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-14 text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-3 text-sm text-neutral-600">还没有对话</p>
            <p className="mt-1 text-xs text-neutral-400">
              在商品详情页点「联系卖家」，对话会出现在这里
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-black"
            >
              去逛逛
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const item = items.find((entry) => entry.id === conversation.itemId)
              const otherName =
                conversation.buyerId === 'me'
                  ? conversation.sellerName
                  : conversation.buyerName
              const otherAvatar =
                conversation.buyerId === 'me'
                  ? conversation.sellerAvatar
                  : conversation.buyerAvatar
              const last = lastMessages[conversation.id]

              return (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                >
                  <div className="relative shrink-0">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-xl">
                      {otherAvatar}
                    </span>
                    {conversation.unread > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold leading-none text-white">
                        {conversation.unread > 99 ? '99+' : conversation.unread}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{otherName}</p>
                      <span className="shrink-0 text-[10px] text-neutral-400">
                        {formatListTime(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                      {last || '开始聊聊这件闲置吧'}
                    </p>
                    {item && (
                      <p className="mt-1 line-clamp-1 text-[10px] text-neutral-400">
                        ¥{item.price} · {item.title}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
