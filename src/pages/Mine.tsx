import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import { categoryMeta } from '../types'
import { formatPrice } from '../utils'

export function Mine() {
  const { items, remove } = useItems()
  const { show } = useToast()

  const mine = items.filter((item) => item.seller === '我')
  const totalLikes = mine.reduce((sum, item) => sum + item.likes, 0)

  async function handleRemove(id: string) {
    if (!window.confirm('确定删除这条闲置吗？')) return
    await remove(id)
    show('已删除')
  }

  return (
    <div>
      <header className="bg-gradient-to-b from-brand to-[#ffe95c] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="text-lg font-extrabold">我的</h1>
      </header>

      <div className="-mt-5 px-4 pb-6">
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-3xl">
            🙂
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold">我</p>
            <p className="text-[11px] text-neutral-400">个人卖家 · 演示账号</p>
          </div>
          <Link
            to="/publish"
            className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-black"
          >
            发布
          </Link>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-2xl font-extrabold">{mine.length}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">我的发布</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-2xl font-extrabold">{totalLikes}</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">获得想要</p>
          </div>
        </section>

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
              {mine.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3"
                >
                  <Link
                    to={`/item/${item.id}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                  >
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl ${categoryMeta(item.category).gradient}`}
                      >
                        {item.cover}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/item/${item.id}`}
                      className="line-clamp-1 text-sm text-neutral-800"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-price">
                      ¥{formatPrice(item.price)}
                    </p>
                    <p className="text-[10px] text-neutral-400">{item.likes} 人想要</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRemove(item.id)}
                    className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs text-neutral-500"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
