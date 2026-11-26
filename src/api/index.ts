import type {
  Category,
  Conversation,
  CreateItemInput,
  Item,
  ItemStatus,
  Message,
  Review,
  SellerProfile,
} from '../types'
import { mockChatApi, mockItemApi, mockSellerApi } from './mock'

export interface ListQuery {
  category?: Category | 'all'
  q?: string
}

/**
 * 前端与后端之间唯一的契约层。
 *
 * 目前实现是本地 mock（localStorage）。接入真实后端时：
 * 1. 在这里新增 http 实现，按下面的接口签名逐个实现；
 * 2. 把文件末尾的三个导出从 mock 换成 http 实现；
 * 3. 页面和组件完全不用改。
 */
export interface ItemApi {
  /** 商品列表，支持分类筛选和关键词搜索 */
  list(query?: ListQuery): Promise<Item[]>
  /** 商品详情 */
  get(id: string): Promise<Item | undefined>
  /** 发布商品 */
  create(input: CreateItemInput): Promise<Item>
  /** 删除商品（仅本人发布的可删） */
  remove(id: string): Promise<void>
  /** “我想要”+1，返回更新后的商品 */
  like(id: string): Promise<Item | undefined>
  /** 卖家标记售出 / 重新上架 */
  updateStatus(id: string, status: ItemStatus): Promise<Item | undefined>
}

export interface ChatApi {
  /** 会话列表（按最后消息时间倒序） */
  conversations(): Promise<Conversation[]>
  /** 某个会话的全部消息 */
  messages(conversationId: string): Promise<Message[]>
  /** 买家点“联系卖家”：拿到或创建与商品卖家的会话 */
  ensure(itemId: string): Promise<Conversation>
  /** 发送一条消息 */
  send(conversationId: string, text: string): Promise<Message>
  /** 进入会话后清空未读 */
  markRead(conversationId: string): Promise<void>
  /** 全部未读数（底部导航红点用） */
  unreadCount(): Promise<number>
  /** 仅演示用：模拟对方自动回复，接真实后端后删除 */
  simulateReply(conversationId: string): Promise<Message | undefined>
}

export interface SellerApi {
  /** 卖家资料与交易统计 */
  get(id: string): Promise<SellerProfile | undefined>
  /** 卖家收到的评价（信用等级的数据来源） */
  reviews(sellerId: string): Promise<Review[]>
}

export const itemApi: ItemApi = mockItemApi
export const chatApi: ChatApi = mockChatApi
export const sellerApi: SellerApi = mockSellerApi

export type {
  Category,
  Conversation,
  CreateItemInput,
  Item,
  ItemStatus,
  Message,
  Review,
  SellerProfile,
}
