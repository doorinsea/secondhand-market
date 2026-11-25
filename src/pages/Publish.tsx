import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'
import { useItems } from '../store/ItemsContext'
import {
  CATEGORIES,
  categoryMeta,
  CONDITIONS,
  type Category,
  type Condition,
} from '../types'

const MAX_IMAGES = 9

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const maxEdge = 900
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器不支持图片处理')

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.72)
}

export function Publish() {
  const navigate = useNavigate()
  const { show } = useToast()
  const { create } = useItems()

  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [condition, setCondition] = useState<Condition>('like-new')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const remain = MAX_IMAGES - images.length
    if (remain <= 0) {
      show('最多上传 9 张图片')
      return
    }
    const picked = Array.from(fileList).slice(0, remain)
    try {
      const results = await Promise.all(picked.map(compressImage))
      setImages((prev) => [...prev, ...results])
    } catch {
      show('图片处理失败，换一张试试')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('先给闲置起个标题')
      return
    }
    if (!category) {
      setError('选一个分类')
      return
    }
    const priceValue = Number(price)
    if (!price.trim() || !Number.isFinite(priceValue) || priceValue <= 0) {
      setError('填一个有效的价格')
      return
    }

    setSubmitting(true)
    try {
      await create({
        title: title.trim(),
        description: description.trim(),
        price: Math.round(priceValue * 100) / 100,
        category,
        condition,
        images,
        cover: categoryMeta(category).emoji,
      })
      show('发布成功，已经在首页啦')
      navigate('/')
    } catch {
      setError('发布失败，稍后再试')
      setSubmitting(false)
    }
  }

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/5 bg-white/95 px-3 py-2.5 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">发布闲置</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 p-3">
        <section className="rounded-2xl bg-white p-3">
          <div className="grid grid-cols-3 gap-2">
            {images.map((source, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
              >
                <img src={source} alt={`上传的图片 ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="删除这张图片"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] leading-none text-white"
                >
                  ×
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 py-0.5 text-[9px] text-white">
                    封面
                  </span>
                )}
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400"
              >
                <span className="text-2xl leading-none">＋</span>
                <span className="text-[11px]">添加图片</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files)
              event.target.value = ''
            }}
          />
          <p className="mt-2 text-[11px] text-neutral-400">
            最多 9 张，第一张作为封面。不传图也可以先发布。
          </p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-4">
          <label className="block">
            <span className="text-sm font-medium">标题</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={40}
              placeholder="例如：iPad Air 4 64G 深空灰"
              className="mt-1.5 w-full rounded-xl bg-neutral-50 px-3 py-2.5 text-sm outline-none ring-1 ring-transparent focus:ring-black/10"
            />
            <span className="mt-1 block text-right text-[10px] text-neutral-400">
              {title.length}/40
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">描述</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="成色、入手时间、使用情况、交易方式…"
              className="mt-1.5 w-full resize-none rounded-xl bg-neutral-50 px-3 py-2.5 text-sm outline-none ring-1 ring-transparent focus:ring-black/10"
            />
          </label>
        </section>

        <section className="rounded-2xl bg-white p-4">
          <h2 className="text-sm font-medium">分类</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {CATEGORIES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setCategory(entry.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs transition ${
                  category === entry.id
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white text-neutral-600'
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {entry.emoji}
                </span>
                {entry.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4">
          <h2 className="text-sm font-medium">价格</h2>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
            <span className="text-sm text-neutral-400">¥</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full bg-transparent text-lg font-semibold outline-none placeholder:font-normal placeholder:text-neutral-300"
            />
          </div>

          <h2 className="mt-4 text-sm font-medium">成色</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDITIONS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setCondition(entry.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  condition === entry.id
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 text-neutral-600'
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="px-1 text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand py-3 text-sm font-bold text-black transition disabled:opacity-60"
        >
          {submitting ? '发布中…' : '发布'}
        </button>

        <p className="pb-2 text-center text-[10px] text-neutral-400">
          发布即表示同意《闲置交易公约》（演示）
        </p>
      </form>
    </div>
  )
}
