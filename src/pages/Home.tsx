import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryTabs } from '../components/CategoryTabs'
import { ItemCard } from '../components/ItemCard'
import { useItems } from '../store/ItemsContext'
import { categoryMeta, type Category } from '../types'

export function Home() {
  const { items, loading, error, refresh } = useItems()
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return items
      .filter((item) => category === 'all' || item.category === category)
      .filter(
        (item) =>
          !keyword ||
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword),
      )
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [items, category, query])

  const heading = category === 'all' ? '最新上架' : `${categoryMeta(category).label}好物`

  return (
    <div>
      <header className="sticky top-0 z-30 bg-gradient-to-b from-brand to-[#ffe95c] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">闲置换换</h1>
            <p className="text-[11px] text-black/50">让闲置流动起来</p>
          </div>
          <Link
            to="/publish"
            className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
          >
            ＋ 发布闲置
          </Link>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 shadow-sm">
          <span className="text-sm text-neutral-400" aria-hidden>
            🔍
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜一搜：iPad、教材、落地灯…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 text-xs text-neutral-400"
            >
              清空
            </button>
          )}
        </div>
      </header>

      <div className="pt-3">
        <CategoryTabs value={category} onChange={setCategory} />
      </div>

      <section className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">{heading}</h2>
          <span className="text-[11px] text-neutral-400">{filtered.length} 件</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-6 text-center">
            <p className="text-sm text-neutral-500">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-3 rounded-full bg-black px-4 py-2 text-xs font-medium text-white"
            >
              重新加载
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center">
            <p className="text-4xl">🫙</p>
            <p className="mt-3 text-sm font-medium text-neutral-700">
              {query ? '没有找到相关闲置' : '这个分类还没有闲置'}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {query ? '换个关键词试试，或者发布一条求购' : '来发布第一件，占个沙发'}
            </p>
            <Link
              to="/publish"
              className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-black"
            >
              去发布
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
