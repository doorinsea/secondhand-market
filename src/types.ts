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

export type ItemStatus = 'available' | 'sold'

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  available: '在售',
  sold: '已售出',
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
  sellerId: string
  sellerAvatar: string
  likes: number
  status: ItemStatus
  /** 发布时可选填的外部联系方式 */
  contact?: string
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
  contact?: string
}

export interface SellerStats {
  soldCount: number
  reviewCount: number
  /** 好评率 0-1 */
  goodRate: number
  /** 平均评分 1-5 */
  avgRating: number
  /** 平均响应时间（分钟） */
  responseMinutes: number
}

export interface SellerProfile {
  id: string
  name: string
  avatar: string
  bio: string
  joinedAt: number
  stats: SellerStats
  isMe?: boolean
}

export type CreditLevel = '新人' | '信誉良好' | '信誉优秀' | '金牌卖家'

export interface CreditInfo {
  level: CreditLevel
  score: number
  className: string
}

/**
 * 信用等级完全由系统根据交易数据计算，不需要人工认证。
 * 规则（演示用）：基础 55 分 + 售出量（封顶 24）+ 好评率 20 + 平均评分 3，满分 100。
 * 金牌卖家额外要求售出 ≥ 30 单。
 */
export function creditOf(stats: SellerStats): CreditInfo {
  const score = Math.min(
    100,
    Math.round(
      55 +
        Math.min(stats.soldCount, 40) * 0.6 +
        (stats.reviewCount > 0 ? stats.goodRate * 20 + stats.avgRating * 3 : 0),
    ),
  )

  let level: CreditLevel = '新人'
  if (score >= 92 && stats.soldCount >= 30) level = '金牌卖家'
  else if (score >= 80) level = '信誉优秀'
  else if (score >= 70) level = '信誉良好'

  const className =
    level === '金牌卖家'
      ? 'bg-amber-100 text-amber-700 ring-amber-200'
      : level === '信誉优秀'
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
        : level === '信誉良好'
          ? 'bg-sky-50 text-sky-700 ring-sky-200'
          : 'bg-neutral-100 text-neutral-500 ring-neutral-200'

  return { level, score, className }
}

export interface Review {
  id: string
  itemId: string
  itemTitle: string
  fromName: string
  fromAvatar: string
  toSellerId: string
  rating: number
  content: string
  createdAt: number
}

export interface ReviewInput {
  itemId: string
  itemTitle: string
  rating: number
  content: string
  fromName?: string
  fromAvatar?: string
}

export interface Conversation {
  id: string
  itemId: string
  buyerId: string
  sellerId: string
  buyerName: string
  buyerAvatar: string
  sellerName: string
  sellerAvatar: string
  createdAt: number
  updatedAt: number
  unread: number
}

export interface Message {
  id: string
  conversationId: string
  fromId: string
  text: string
  createdAt: number
}

export const ME = {
  id: 'me',
  name: '我',
  avatar: '🙂',
} as const

export const QUICK_REPLIES = [
  '还在吗？',
  '能小刀吗？',
  '包邮吗？',
  '可以看看细节图吗？',
  '在哪里交易？',
  '可以验货吗？',
]
