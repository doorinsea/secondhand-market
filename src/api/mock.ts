import type { CreateItemInput, Item } from '../types'
import { seedItems } from '../data/seed'

const STORAGE_KEY = 'secondhand.items.v1'

function read(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...seedItems]
    const parsed = JSON.parse(raw) as Item[]
    return Array.isArray(parsed) ? parsed : [...seedItems]
  } catch {
    return [...seedItems]
  }
}

function write(items: Item[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const delay = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export interface ListQuery {
  category?: Item['category'] | 'all'
  q?: string
}

/**
 * 本地 mock 实现：数据存在 localStorage 里，刷新不丢。
 * 后端同学接真实接口时，只需要替换 src/api/index.ts 里的实现。
 */
export const mockApi = {
  async list(query: ListQuery = {}): Promise<Item[]> {
    await delay()
    let items = read()

    if (query.category && query.category !== 'all') {
      items = items.filter((item) => item.category === query.category)
    }

    const q = query.q?.trim().toLowerCase()
    if (q) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      )
    }

    return items.sort((a, b) => b.createdAt - a.createdAt)
  },

  async get(id: string): Promise<Item | undefined> {
    await delay(60)
    return read().find((item) => item.id === id)
  },

  async create(input: CreateItemInput): Promise<Item> {
    await delay(200)
    const items = read()
    const item: Item = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      category: input.category,
      condition: input.condition,
      images: input.images,
      cover: input.cover ?? '🛍️',
      seller: '我',
      sellerAvatar: '🙂',
      likes: 0,
      createdAt: Date.now(),
    }
    items.unshift(item)
    write(items)
    return item
  },

  async remove(id: string): Promise<void> {
    await delay(120)
    write(read().filter((item) => item.id !== id))
  },

  async like(id: string): Promise<Item | undefined> {
    await delay(60)
    const items = read()
    const target = items.find((item) => item.id === id)
    if (target) {
      target.likes += 1
      write(items)
    }
    return target
  },
}
