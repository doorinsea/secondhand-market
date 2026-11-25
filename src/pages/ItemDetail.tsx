import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import { categoryMeta, CONDITION_LABEL } from '../types'
import { formatPrice, timeAgo } from '../utils'

export function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { show } = useToast()
  const { items, loading, like } = useItems()
  const [active, setActive] = useState(0)

  const item = items.find((entry) => entry.id === id)

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center">
        <p className="text-4xl">🔍</p>
        <p className="text-sm text-neutral-600">这件闲置可能已经被卖掉了</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold"
        >
          回首页逛逛
        </button>
      </div>
    )
  }

  const meta = categoryMeta(item.category)
  const images = item.images

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className={`relative aspect-square w-full bg-gradient-to-br ${meta.gradient}`}>
        {images.length > 0 ? (
          <div
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto"
            onScroll={(event) => {
              const track = event.currentTarget
              setActive(Math.round(track.scrollLeft / track.clientWidth))
            }}
          >
            {images.map((source, index) => (
              <img
                key={index}
                src={source}
                alt={`${item.title} 图片 ${index + 1}`}
                className="h-full w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[7rem]">
            {item.cover}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="absolute left-3 top-[calc(env(safe-area-inset-top)+0.75rem)] flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
        >
          ←
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-5 px-4 py-4">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-extrabold text-price">
              <span className="text-sm">¥</span>
              {formatPrice(item.price)}
            </span>
            <span className="pb-1 text-xs text-neutral-400">
              {CONDITION_LABEL[item.condition]} · {item.likes} 人想要
            </span>
          </div>
          <h1 className="mt-2 text-lg font-semibold leading-7">{item.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span
            className={`rounded-full bg-gradient-to-r px-2.5 py-1 text-neutral-700 ${meta.gradient}`}
          >
            {meta.emoji} {meta.label}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600">
            {CONDITION_LABEL[item.condition]}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600">
            {timeAgo(item.createdAt)}发布
          </span>
        </div>

        <section>
          <h2 className="mb-1.5 text-sm font-semibold">商品描述</h2>
          <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {item.description || '卖家很懒，什么都没写。'}
          </p>
        </section>

        <section className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
            {item.sellerAvatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.seller}</p>
            <p className="text-[11px] text-neutral-400">个人卖家 · 信用良好</p>
          </div>
          <button
            type="button"
            onClick={() => show('主页功能还没接，先看看商品吧')}
            className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-neutral-600"
          >
            查看主页
          </button>
        </section>

        <p className="pb-2 text-[11px] leading-5 text-neutral-400">
          提示：同城优先当面交易，验货后再确认。不要脱离平台转账。
        </p>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-black/5 bg-white/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
        <div className="flex-1">
          <p className="text-[11px] text-neutral-400">到手价</p>
          <p className="text-xl font-extrabold text-price">
            <span className="text-xs">¥</span>
            {formatPrice(item.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => show('已发送联系请求，卖家会收到通知（演示）')}
          className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium"
        >
          联系卖家
        </button>
        <button
          type="button"
          onClick={() => {
            void like(item.id)
            show('已加入想要，卖家会收到通知')
          }}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold shadow-sm"
        >
          我想要
        </button>
      </div>
    </div>
  )
}
