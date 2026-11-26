import { Link } from 'react-router-dom'
import { categoryMeta, CONDITION_LABEL, type Item } from '../types'
import { formatPrice } from '../utils'

export function ItemCard({ item }: { item: Item }) {
  const meta = categoryMeta(item.category)
  const cover = item.images[0]
  const sold = item.status === 'sold'

  return (
    <Link
      to={`/item/${item.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03] transition active:scale-[0.98]"
    >
      <div className={`relative aspect-square w-full bg-gradient-to-br ${meta.gradient}`}>
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            className={`h-full w-full object-cover ${sold ? 'grayscale' : ''}`}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-5xl ${
              sold ? 'opacity-60 grayscale' : ''
            }`}
          >
            {item.cover}
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-neutral-700 backdrop-blur">
          {CONDITION_LABEL[item.condition]}
        </span>

        {sold && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="-rotate-12 rounded-full border-[3px] border-red-500 bg-white/85 px-4 py-1.5 text-base font-black tracking-widest text-red-500 shadow-lg">
                已售出
              </span>
            </div>
          </>
        )}
      </div>

      <div className="space-y-1 p-2.5">
        <h3
          className={`line-clamp-2 min-h-10 text-[13px] leading-5 ${
            sold ? 'text-neutral-400' : 'text-neutral-800'
          }`}
        >
          {item.title}
        </h3>
        <div className="flex items-baseline justify-between gap-1">
          <span
            className={`text-[15px] font-bold ${
              sold ? 'text-neutral-400 line-through' : 'text-price'
            }`}
          >
            <span className="text-[11px]">¥</span>
            {formatPrice(item.price)}
          </span>
          <span className="shrink-0 text-[10px] text-neutral-400">
            {sold ? '已售出' : `${item.likes} 人想要`}
          </span>
        </div>
      </div>
    </Link>
  )
}
