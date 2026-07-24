import type { View } from '../App'
import Icon, { type IconName } from './Icon'

const ITEMS: { key: View; icon: IconName; label: string }[] = [
  { key: 'home', icon: 'home', label: '홈' },
  { key: 'learn', icon: 'cards', label: '학습' },
  { key: 'quiz', icon: 'quiz', label: '퀴즈' },
  { key: 'browse', icon: 'book', label: '단어장' },
  { key: 'community', icon: 'chat', label: '커뮤니티' },
]

export default function Nav({
  view,
  onChange,
}: {
  view: View
  onChange: (v: View) => void
}) {
  return (
    <nav className="nav">
      {ITEMS.map((it) => {
        const active = view === it.key
        return (
          <button
            key={it.key}
            className={active ? 'active' : ''}
            onClick={() => onChange(it.key)}
            aria-current={active ? 'page' : undefined}
            aria-label={it.label}
          >
            <span className="ni">
              <Icon name={it.icon} size={22} strokeWidth={active ? 2.4 : 2} />
            </span>
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}
