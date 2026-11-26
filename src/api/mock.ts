import type {
  Conversation,
  CreateItemInput,
  Item,
  ItemStatus,
  Message,
  Review,
  SellerProfile,
} from '../types'
import { seedConversations, seedMessages } from '../data/chat'
import { seedItems } from '../data/seed'
import { sellerProfiles, sellerReviews } from '../data/sellers'

const ITEMS_KEY = 'secondhand.items.v2'
const CONVOS_KEY = 'secondhand.conversations.v1'
const MESSAGES_KEY = 'secondhand.messages.v1'

const delay = (ms = 100) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return clone(fallback)
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

function save<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadItems() {
  return load<Item>(ITEMS_KEY, seedItems)
}

function loadConversations() {
  return load<Conversation>(CONVOS_KEY, seedConversations)
}

function loadMessages() {
  return load<Message>(MESSAGES_KEY, seedMessages)
}

const REPLY_POOL: { test: RegExp; replies: string[] }[] = [
  {
    test: /便宜|小刀|少|刀/,
    replies: [
      '这个价格已经挺实在了，最多再让 20。',
      '可以小刀，你出个价？',
      '已经是底价啦，诚心要可以送个小配件。',
    ],
  },
  {
    test: /包邮|邮费/,
    replies: ['同城可以自提，外地邮费我出一半。', '包邮可以的，发顺丰。'],
  },
  {
    test: /在吗|还在|在么/,
    replies: ['在的，随时可以聊。', '在，东西还在。'],
  },
  {
    test: /细节|图/,
    replies: ['我拍两张细节图发你。', '可以的，稍等我拍一下。'],
  },
  {
    test: /交易|见面|哪里|面交|自提/,
    replies: ['同城地铁站面交，你看哪里方便？', '周末可以在学校门口见面。'],
  },
  {
    test: /验货|验机/,
    replies: ['可以当面验，验好再确认。', '支持验机，没问题再交易。'],
  },
]

function pickReply(text: string): string {
  for (const entry of REPLY_POOL) {
    if (entry.test.test(text)) {
      return entry.replies[Math.floor(Math.random() * entry.replies.length)]
    }
  }
  return ['收到，我看一下。', '嗯嗯，可以的。', '这个我得想想，晚点回复你。'][
    Math.floor(Math.random() * 3)
  ]
}

export const mockItemApi = {
  async list(query: { category?: Item['category'] | 'all'; q?: string } = {}): Promise<Item[]> {
    await delay()
    let items = loadItems()

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
    return loadItems().find((item) => item.id === id)
  },

  async create(input: CreateItemInput): Promise<Item> {
    await delay(200)
    const items = loadItems()
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
      sellerId: 'me',
      sellerAvatar: '🙂',
      likes: 0,
      status: 'available',
      contact: input.contact?.trim() || undefined,
      createdAt: Date.now(),
    }
    items.unshift(item)
    save(ITEMS_KEY, items)
    return item
  },

  async remove(id: string): Promise<void> {
    await delay(120)
    save(
      ITEMS_KEY,
      loadItems().filter((item) => item.id !== id),
    )
  },

  async like(id: string): Promise<Item | undefined> {
    await delay(60)
    const items = loadItems()
    const target = items.find((item) => item.id === id)
    if (target) {
      target.likes += 1
      save(ITEMS_KEY, items)
    }
    return target
  },

  async updateStatus(id: string, status: ItemStatus): Promise<Item | undefined> {
    await delay(80)
    const items = loadItems()
    const target = items.find((item) => item.id === id)
    if (target) {
      target.status = status
      save(ITEMS_KEY, items)
    }
    return target
  },
}

export const mockChatApi = {
  async conversations(): Promise<Conversation[]> {
    await delay()
    return loadConversations().sort((a, b) => b.updatedAt - a.updatedAt)
  },

  async messages(conversationId: string): Promise<Message[]> {
    await delay(60)
    return loadMessages()
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt)
  },

  /** 以当前用户（买家）身份打开与商品卖家的会话，没有就新建 */
  async ensure(itemId: string): Promise<Conversation> {
    await delay(120)
    const item = loadItems().find((entry) => entry.id === itemId)
    if (!item) throw new Error('商品不存在')
    if (item.sellerId === 'me') throw new Error('这是你自己发布的商品')

    const conversations = loadConversations()
    const existing = conversations.find(
      (conversation) => conversation.itemId === itemId && conversation.buyerId === 'me',
    )
    if (existing) return existing

    const conversation: Conversation = {
      id: `convo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId,
      buyerId: 'me',
      sellerId: item.sellerId,
      buyerName: '我',
      buyerAvatar: '🙂',
      sellerName: item.seller,
      sellerAvatar: item.sellerAvatar,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unread: 0,
    }
    conversations.push(conversation)
    save(CONVOS_KEY, conversations)
    return conversation
  },

  async send(conversationId: string, text: string): Promise<Message> {
    await delay(80)
    const conversations = loadConversations()
    const conversation = conversations.find((entry) => entry.id === conversationId)
    if (!conversation) throw new Error('会话不存在')

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      fromId: 'me',
      text: text.trim(),
      createdAt: Date.now(),
    }

    const messages = loadMessages()
    messages.push(message)
    save(MESSAGES_KEY, messages)

    conversation.updatedAt = message.createdAt
    save(CONVOS_KEY, conversations)
    return message
  },

  async markRead(conversationId: string): Promise<void> {
    const conversations = loadConversations()
    const conversation = conversations.find((entry) => entry.id === conversationId)
    if (conversation) {
      conversation.unread = 0
      save(CONVOS_KEY, conversations)
    }
  },

  async unreadCount(): Promise<number> {
    return loadConversations().reduce((sum, conversation) => sum + conversation.unread, 0)
  },

  /** 演示用：对方自动回一句（真实后端接入后删除） */
  async simulateReply(conversationId: string): Promise<Message | undefined> {
    await delay(900)
    const conversations = loadConversations()
    const conversation = conversations.find((entry) => entry.id === conversationId)
    if (!conversation) return undefined

    const messages = loadMessages()
    const lastMine = [...messages]
      .reverse()
      .find((message) => message.conversationId === conversationId && message.fromId === 'me')

    const otherId = conversation.buyerId === 'me' ? conversation.sellerId : conversation.buyerId
    const reply: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      fromId: otherId,
      text: pickReply(lastMine?.text ?? ''),
      createdAt: Date.now(),
    }

    messages.push(reply)
    save(MESSAGES_KEY, messages)

    conversation.updatedAt = reply.createdAt
    save(CONVOS_KEY, conversations)
    return reply
  },
}

export const mockSellerApi = {
  async get(id: string): Promise<SellerProfile | undefined> {
    await delay(60)
    return sellerProfiles.find((seller) => seller.id === id)
  },

  async reviews(sellerId: string): Promise<Review[]> {
    await delay(80)
    return sellerReviews
      .filter((review) => review.toSellerId === sellerId)
      .sort((a, b) => b.createdAt - a.createdAt)
  },
}
