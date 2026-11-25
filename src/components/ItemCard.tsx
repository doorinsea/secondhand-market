import { Link } from 'react-router-dom'
import { categoryMeta, CONDITION_LABEL, type Item } from '../types'
import { formatPrice } from '../utils'

export function ItemCard({ item }: { item: Item }) {
  const meta = categoryMeta(item.category)
  const cover = item.images[0]

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
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {item.cover}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-neutral-700 backdrop-blur">
          {CONDITION_LABEL[item.condition]}
        </span>
      </div>

      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 min-h-10 text-[13px] leading-5 text-neutral-800">
          {item.title}
        </h3>
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-[15px] font-bold text-price">
            <span className="text-[11px]">¥</span>
            {formatPrice(item.price)}
          </span>
          <span className="shrink-0 text-[10px] text-neutral-400">{item.likes} 人想要</span>
        </div>
      </div>
    </Link>
  )
}
