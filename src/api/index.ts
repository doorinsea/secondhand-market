import type { Category, CreateItemInput, Item } from '../types'
import { mockApi } from './mock'

export interface ListQuery {
  category?: Category | 'all'
  q?: string
}

/**
 * 前端与后端之间唯一的契约层。
 *
 * 目前实现是本地 mock（localStorage）。接入真实后端时：
 * 1. 在这里新增一个 httpApi，按下面的接口签名实现；
 * 2. 把文件末尾的 `itemApi` 从 mockApi 换成 httpApi；
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
}

export const itemApi: ItemApi = mockApi

export type { Category, CreateItemInput, Item }
