import { CATEGORIES, type Category } from '../types'

interface CategoryTabsProps {
  value: Category | 'all'
  onChange: (value: Category | 'all') => void
}

const tabs = [{ id: 'all' as const, label: '全部', emoji: '✨' }, ...CATEGORIES]

export function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
      {tabs.map((tab) => {
        const active = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={active}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? 'border-black bg-black text-white'
                : 'border-black/10 bg-white text-neutral-600'
            }`}
          >
            <span aria-hidden>{tab.emoji}</span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
