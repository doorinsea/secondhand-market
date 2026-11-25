export type Category = 'life' | 'digital' | 'study' | 'other'

export interface CategoryMeta {
  id: Category
  label: string
  emoji: string
  gradient: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'life', label: '生活', emoji: '🏠', gradient: 'from-amber-100 to-orange-200' },
  { id: 'digital', label: '数码', emoji: '📱', gradient: 'from-sky-100 to-blue-200' },
  { id: 'study', label: '学习', emoji: '📚', gradient: 'from-emerald-100 to-teal-200' },
  { id: 'other', label: '其他', emoji: '📦', gradient: 'from-violet-100 to-purple-200' },
]

export function categoryMeta(id: Category): CategoryMeta {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[3]
}

export type Condition = 'new' | 'like-new' | 'good' | 'fair'

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: 'new', label: '全新' },
  { id: 'like-new', label: '几乎全新' },
  { id: 'good', label: '轻微使用' },
  { id: 'fair', label: '明显使用' },
]

export const CONDITION_LABEL: Record<Condition, string> = {
  new: '全新',
  'like-new': '几乎全新',
  good: '轻微使用',
  fair: '明显使用',
}

export interface Item {
  id: string
  title: string
  description: string
  price: number
  category: Category
  condition: Condition
  /** 用户上传的图片，data URL 形式；为空时用 cover 表情占位 */
  images: string[]
  /** 没有图片时展示的封面表情 */
  cover: string
  seller: string
  sellerAvatar: string
  likes: number
  createdAt: number
}

export interface CreateItemInput {
  title: string
  description: string
  price: number
  category: Category
  condition: Condition
  images: string[]
  cover?: string
}
