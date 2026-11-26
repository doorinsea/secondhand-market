import type { Conversation, Message } from '../types'

const now = Date.now()
const minutesAgo = (minutes: number) => now - minutes * 60_000

export const seedConversations: Conversation[] = [
  {
    id: 'convo-1',
    itemId: 'seed-1',
    buyerId: 'me',
    sellerId: 'u-xiaolu',
    buyerName: '我',
    buyerAvatar: '🙂',
    sellerName: '小鹿',
    sellerAvatar: '🦌',
    createdAt: minutesAgo(95),
    updatedAt: minutesAgo(20),
    unread: 1,
  },
  {
    id: 'convo-2',
    itemId: 'seed-4',
    buyerId: 'me',
    sellerId: 'u-laozhou',
    buyerName: '我',
    buyerAvatar: '🙂',
    sellerName: '老周',
    sellerAvatar: '🧔',
    createdAt: minutesAgo(200),
    updatedAt: minutesAgo(180),
    unread: 0,
  },
  {
    id: 'convo-3',
    itemId: 'seed-mine-1',
    buyerId: 'u-xiaolin',
    sellerId: 'me',
    buyerName: '小林',
    buyerAvatar: '🐼',
    sellerName: '我',
    sellerAvatar: '🙂',
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(8),
    unread: 2,
  },
]

export const seedMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'convo-1',
    fromId: 'me',
    text: '你好，落地灯还在吗？',
    createdAt: minutesAgo(95),
  },
  {
    id: 'msg-2',
    conversationId: 'convo-1',
    fromId: 'u-xiaolu',
    text: '在的，灯罩没有磕碰，周末可以约看。',
    createdAt: minutesAgo(88),
  },
  {
    id: 'msg-3',
    conversationId: 'convo-1',
    fromId: 'me',
    text: '好的，周六下午方便吗？',
    createdAt: minutesAgo(20),
  },
  {
    id: 'msg-4',
    conversationId: 'convo-2',
    fromId: 'me',
    text: 'iPad 能小刀吗？',
    createdAt: minutesAgo(200),
  },
  {
    id: 'msg-5',
    conversationId: 'convo-2',
    fromId: 'u-laozhou',
    text: '最多让 50，配件都齐全。',
    createdAt: minutesAgo(180),
  },
  {
    id: 'msg-6',
    conversationId: 'convo-3',
    fromId: 'u-xiaolin',
    text: 'Kindle 还在吗？',
    createdAt: minutesAgo(10),
  },
  {
    id: 'msg-7',
    conversationId: 'convo-3',
    fromId: 'u-xiaolin',
    text: '能便宜点吗，300 可以吗？',
    createdAt: minutesAgo(8),
  },
]
