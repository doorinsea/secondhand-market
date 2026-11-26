import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { chatApi, sellerApi } from '../api'
import { ItemCard } from '../components/ItemCard'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import { creditOf, type Review, type SellerProfile } from '../types'
import { timeAgo } from '../utils'

export function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { show } = useToast()
  const { items, loading: itemsLoading } = useItems()

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!id) return
      try {
        const [profile, reviewList] = await Promise.all([
          sellerApi.get(id),
          sellerApi.reviews(id),
        ])
        if (!alive) return
        setSeller(profile ?? null)
        setReviews(reviewList)
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()
    return () => {
      alive = false
    }
  }, [id])

  if (loading || itemsLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f4f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🙈</p>
        <p className="text-sm text-neutral-500">没有找到这个用户</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold"
        >
          回首页
        </button>
      </div>
    )
  }

  const credit = creditOf(seller.stats)
  const selling = items.filter(
    (item) => item.sellerId === seller.id && item.status === 'available',
  )

  async function handleContact() {
    const target = selling[0]
    if (!target) {
      show('TA 暂时没有在售商品')
      return
    }
    try {
      const conversation = await chatApi.ensure(target.id)
      navigate(`/chat/${conversation.id}`)
    } catch {
      show('暂时无法发起对话')
    }
  }

  return (
    <div>
      <header className="bg-gradient-to-b from-brand to-[#ffe95c] px-4 pb-10 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="返回"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
          >
            ←
          </button>
          <h1 className="text-base font-semibold">个人主页</h1>
        </div>
      </header>

      <div className="-mt-6 space-y-3 px-4 pb-8">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-4xl">
              {seller.avatar}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold">{seller.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${credit.className}`}
                >
                  {credit.level}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                加入 {timeAgo(seller.joinedAt)} · 信用分 {credit.score}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-neutral-500">{seller.bio}</p>

          <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-neutral-50 p-3 text-center">
            <div>
              <p className="text-base font-bold">{seller.stats.soldCount}</p>
              <p className="text-[10px] text-neutral-400">已售出</p>
            </div>
            <div>
              <p className="text-base font-bold">{seller.stats.reviewCount}</p>
              <p className="text-[10px] text-neutral-400">评价</p>
            </div>
            <div>
              <p className="text-base font-bold">{Math.round(seller.stats.goodRate * 100)}%</p>
              <p className="text-[10px] text-neutral-400">好评率</p>
            </div>
            <div>
              <p className="text-base font-bold">~{seller.stats.responseMinutes}分</p>
              <p className="text-[10px] text-neutral-400">响应</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">在售闲置</h2>
            <span className="text-[11px] text-neutral-400">{selling.length} 件</span>
          </div>
          {selling.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-8 text-center text-sm text-neutral-400">
              暂时没有在售的闲置
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {selling.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold">买家评价</h2>
            <span className="text-[11px] text-neutral-400">{reviews.length} 条</span>
          </div>
          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-8 text-center text-sm text-neutral-400">
              还没有收到评价
            </div>
          ) : (
            <div className="space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-white p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{review.fromAvatar}</span>
                    <span className="text-xs font-medium">{review.fromName}</span>
                    <span className="text-[11px] tracking-tight text-amber-500">
                      {'★'.repeat(review.rating)}
                      <span className="text-neutral-300">{'★'.repeat(5 - review.rating)}</span>
                    </span>
                    <span className="ml-auto text-[10px] text-neutral-400">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-neutral-600">{review.content}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    来自「{review.itemTitle}」
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {!seller.isMe && (
          <button
            type="button"
            onClick={() => void handleContact()}
            className="w-full rounded-full bg-brand py-3 text-sm font-bold text-black"
          >
            联系 TA
          </button>
        )}

        {seller.isMe && (
          <Link
            to="/mine"
            className="block w-full rounded-full border border-black/10 bg-white py-3 text-center text-sm font-medium text-neutral-600"
          >
            是我自己，去「我的」管理发布
          </Link>
        )}
      </div>
    </div>
  )
}
