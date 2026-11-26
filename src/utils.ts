export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

export function formatPrice(price: number): string {
  return Number.isInteger(price) ? String(price) : price.toFixed(2)
}

/** 聊天消息时间：今天显示 HH:mm，更早显示 M/D */
export function formatClock(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/** 会话列表的时间：今天 HH:mm，昨天「昨天」，更早 M/D */
export function formatListTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const oneDay = 86_400_000
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  if (date.getTime() >= startOfToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (date.getTime() >= startOfToday - oneDay) return '昨天'
  return `${date.getMonth() + 1}/${date.getDate()}`
}
