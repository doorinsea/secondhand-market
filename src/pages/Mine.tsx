import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatApi, sellerApi } from '../api'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import { categoryMeta, type Item, type ItemStatus, type Review } from '../types'
import { formatPrice } from '../utils'

const DEFAULT_CONTENTS: Record<number, string> = {
  5: '东西和描述一致，卖家很爽快，好评。',
  4: '整体不错，就是约时间稍微等了一下。',
  3: '凑合吧，有些细节没提前说。',
  2: '和描述有点出入，沟通也不太顺畅。',
  1: '体验不太好，建议谨慎。',
}

export function Mine() {
  const { items, remove, updateStatus } = useItems()
  const { show } = useToast()

  const [unread, setUnread] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewing, setReviewing] = useState<Item | null>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState(DEFAULT_CONTENTS[5])
  const [submitting, setSubmitting] = useState(false)

  const mine = items.filter((item) => item.sellerId === 'me' || item.seller === '我')
  const availableCount = mine.filter((item) => item.status === 'available').length
  const totalLikes = mine.reduce((sum, item) => sum + item.likes, 0)
  const reviewedItemIds = new Set(reviews.map((review) => review.itemId))

  useEffect(() => {
    chatApi
      .unreadCount()
      .then(setUnread)
      .catch(() => {})
    sellerApi
      .reviews('me')
      .then(setReviews)
      .catch(() => {})
  }, [])

  async function handleRemove(id: string) {
    if (!window.confirm('确定删除这条闲置吗？')) return
    await remove(id)
    show('已删除')
  }

  async function toggleStatus(id: string, status: ItemStatus) {
    await updateStatus(id, status)
    show(status === 'sold' ? '已标记为售出' : '已重新上架')
  }

  function openReview(item: Item) {
    setReviewing(item)
    setRating(5)
    setContent(DEFAULT_CONTENTS[5])
  }

  function pickRating(value: number) {
    setRating(value)
    setContent(DEFAULT_CONTENTS[value] ?? '')
  }

  async function submitReview() {
    if (!reviewing || !content.trim() || submitting) return
    setSubmitting(true)
    try {
      const review = await sellerApi.addReview({
        itemId: reviewing.id,
        itemTitle: reviewing.title,
        rating,
        content,
      })
      setReviews((prev) => [review, ...prev])
      setReviewing(null)
      show('评价已提交，信用分已更新')
    } catch {
      show('提交失败，稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <header className="bg-gradient-to-b from-brand to-[#ffe95c] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-lg font-extrabold">我的</h1>
      </header>

      <div className="-mt-5 px-4 pb-6">
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Link
            to="/user/me"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-3xl"
          >
            🙂
          </Link>
          <div className="flex-1">
            <Link to="/user/me" className="flex items-center gap-1">
              <p className="text-base font-semibold">我</p>
              <span className="text-[10px] text-neutral-400">查看主页 ›</span>
            </Link>
            <p className="text-[11px] text-neutral-400">个人卖家 · 演示账号</p>
          </div>
          <Link
            to="/publish"
            className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-black"
          >
            发布
          </Link>
        </section>

        <section className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white p-3 text-center">
            <p className="text-xl font-extrabold">{mine.length}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">我的发布</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center">
            <p className="text-xl font-extrabold">{availableCount}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">在售中</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center">
            <p className="text-xl font-extrabold">{totalLikes}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">获得想要</p>
          </div>
        </section>

        <Link
          to="/messages"
          className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-4"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-xl">
            💬
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">我的消息</p>
            <p className="text-[11px] text-neutral-400">买家和卖家的对话都在这里</p>
          </div>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <span className="text-lg text-neutral-300">›</span>
        </Link>

        <section className="mt-4">
          <h2 className="mb-2 px-1 text-sm font-semibold">我发布的</h2>

          {mine.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center">
              <p className="text-4xl">📦</p>
              <p className="mt-3 text-sm text-neutral-600">还没有发布过闲置</p>
              <Link
                to="/publish"
                className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-black"
              >
                去发布
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mine.map((item) => {
                const sold = item.status === 'sold'
                const reviewed = reviewedItemIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3"
                  >
                    <Link
                      to={`/item/${item.id}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                    >
                      {item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl ${
                            categoryMeta(item.category).gradient
                          } ${sold ? 'opacity-60 grayscale' : ''}`}
                        >
                          {item.cover}
                        </div>
                      )}
                      {sold && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="-rotate-12 rounded-full border-2 border-red-500 bg-white/85 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
                            已售出
                          </span>
                        </span>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/item/${item.id}`}
                        className={`line-clamp-1 text-sm ${
                          sold ? 'text-neutral-400' : 'text-neutral-800'
                        }`}
                      >
                        {item.title}
                      </Link>
                      <p
                        className={`mt-1 text-sm font-bold ${
                          sold ? 'text-neutral-400' : 'text-price'
                        }`}
                      >
                        ¥{formatPrice(item.price)}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {sold ? (
                          reviewed ? (
                            <span className="text-emerald-600">已售出 · 已评价</span>
                          ) : (
                            <span>
                              已售出 ·{' '}
                              <button
                                type="button"
                                onClick={() => openReview(item)}
                                className="text-sky-600 underline"
                              >
                                模拟买家评价
                              </button>
                            </span>
                          )
                        ) : (
                          `${item.likes} 人想要`
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          void toggleStatus(item.id, sold ? 'available' : 'sold')
                        }
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          sold
                            ? 'bg-neutral-100 text-neutral-600'
                            : 'bg-brand text-black'
                        }`}
                      >
                        {sold ? '重新上架' : '标记售出'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(item.id)}
                        className="rounded-full border border-black/10 px-3 py-1 text-[11px] text-neutral-500"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {reviewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setReviewing(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold">模拟买家评价</h2>
            <p className="mt-1 line-clamp-1 text-xs text-neutral-400">
              给「{reviewing.title}」留一条评价，会更新你的信用等级
            </p>

            <div className="mt-3 flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => pickRating(value)}
                  aria-label={`${value} 星`}
                  className={value <= rating ? 'text-amber-400' : 'text-neutral-200'}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              maxLength={120}
              placeholder="写点评价…"
              className="mt-3 w-full resize-none rounded-xl bg-neutral-50 p-3 text-sm outline-none"
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewing(null)}
                className="flex-1 rounded-full border border-black/10 py-2 text-sm text-neutral-600"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void submitReview()}
                disabled={!content.trim() || submitting}
                className="flex-1 rounded-full bg-brand py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                {submitting ? '提交中…' : '提交评价'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
