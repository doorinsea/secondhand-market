import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { chatApi } from '../api'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import { QUICK_REPLIES, type Conversation, type Message } from '../types'
import { formatClock, formatPrice } from '../utils'

export function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { show } = useToast()
  const { items } = useItems()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const item = conversation
    ? items.find((entry) => entry.id === conversation.itemId)
    : undefined

  useEffect(() => {
    let alive = true

    async function load() {
      if (!id) return
      try {
        const conversations = await chatApi.conversations()
        const target = conversations.find((entry) => entry.id === id)
        if (!alive) return
        if (!target) {
          setLoading(false)
          return
        }
        setConversation(target)
        const history = await chatApi.messages(id)
        if (!alive) return
        setMessages(history)
        await chatApi.markRead(id)
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function send(text: string) {
    if (!id || !text.trim() || sending) return
    setSending(true)
    try {
      const message = await chatApi.send(id, text)
      setMessages((prev) => [...prev, message])
      setDraft('')
      setSending(false)

      // 演示模式：模拟对方回复
      const reply = await chatApi.simulateReply(id)
      if (reply) setMessages((prev) => [...prev, reply])
    } catch {
      show('发送失败，稍后再试')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f4f4f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 bg-[#f4f4f5] px-6 text-center">
        <p className="text-4xl">💬</p>
        <p className="text-sm text-neutral-500">这个会话不存在或已失效</p>
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold"
        >
          去消息列表
        </button>
      </div>
    )
  }

  const otherName =
    conversation.buyerId === 'me' ? conversation.sellerName : conversation.buyerName
  const otherAvatar =
    conversation.buyerId === 'me' ? conversation.sellerAvatar : conversation.buyerAvatar
  const sold = item?.status === 'sold'

  return (
    <div className="flex h-dvh flex-col bg-[#f4f4f5]">
      <header className="flex items-center gap-2 border-b border-black/5 bg-white/95 px-3 py-2.5 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
        >
          ←
        </button>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-xl" aria-hidden>
            {otherAvatar}
          </span>
          <div>
            <p className="text-sm font-semibold">{otherName}</p>
            <p className="text-[10px] text-neutral-400">演示模式 · 对方回复为模拟数据</p>
          </div>
        </div>
      </header>

      {item && (
        <Link
          to={`/item/${item.id}`}
          className="mx-3 mt-3 flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-sm"
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-2xl ${
              item.images[0] ? 'bg-neutral-100' : 'from-neutral-100 to-neutral-200'
            } ${sold ? 'opacity-60' : ''}`}
          >
            {item.images[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              item.cover
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs text-neutral-700">{item.title}</p>
            <p className="text-sm font-bold text-price">
              ¥{formatPrice(item.price)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
              sold ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {sold ? '已售出' : '在售'}
          </span>
        </Link>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <p className="text-center text-[10px] text-neutral-400">
          请勿脱离平台转账，当面验货更安全
        </p>

        {messages.map((message) => {
          const mine = message.fromId === 'me'
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-base shadow-sm`}
              >
                {mine ? '🙂' : otherAvatar}
              </span>
              <div
                className={`flex max-w-[72%] flex-col gap-0.5 ${
                  mine ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-5 ${
                    mine
                      ? 'rounded-br-sm bg-brand text-black'
                      : 'rounded-bl-sm bg-white text-neutral-800'
                  }`}
                >
                  {message.text}
                </div>
                <span className="px-1 text-[9px] text-neutral-400">
                  {formatClock(message.createdAt)}
                </span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-black/5 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur">
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => void send(reply)}
              className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-neutral-600"
            >
              {reply}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                void send(draft)
              }
            }}
            placeholder="说点什么…"
            className="flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-sm outline-none placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={() => void send(draft)}
            disabled={!draft.trim() || sending}
            className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
