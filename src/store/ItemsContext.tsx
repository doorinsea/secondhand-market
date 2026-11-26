import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { itemApi } from '../api'
import type { CreateItemInput, Item, ItemStatus } from '../types'

interface ItemsContextValue {
  items: Item[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (input: CreateItemInput) => Promise<Item>
  remove: (id: string) => Promise<void>
  like: (id: string) => Promise<void>
  updateStatus: (id: string, status: ItemStatus) => Promise<void>
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const next = await itemApi.list()
      setItems(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(async (input: CreateItemInput) => {
    const item = await itemApi.create(input)
    setItems((prev) => [item, ...prev])
    return item
  }, [])

  const remove = useCallback(async (id: string) => {
    await itemApi.remove(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const like = useCallback(async (id: string) => {
    const updated = await itemApi.like(id)
    if (updated) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: updated.likes } : item)),
      )
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: ItemStatus) => {
    const updated = await itemApi.updateStatus(id, status)
    if (updated) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item)),
      )
    }
  }, [])

  const value = useMemo(
    () => ({ items, loading, error, refresh, create, remove, like, updateStatus }),
    [items, loading, error, refresh, create, remove, like, updateStatus],
  )

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
}

export function useItems(): ItemsContextValue {
  const context = useContext(ItemsContext)
  if (!context) {
    throw new Error('useItems 必须在 ItemsProvider 内部使用')
  }
  return context
}
