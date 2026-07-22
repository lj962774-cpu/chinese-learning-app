import type { View } from '../App'

const ITEMS: { key: View; icon: string; label: string }[] = [
  { key: 'home', icon: '🏠', label: '홈' },
  { key: 'learn', icon: '🎴', label: '학습' },
  { key: 'quiz', icon: '✏️', label: '퀴즈' },
  { key: 'browse', icon: '📚', label: '단어장' },
  { key: 'community', icon: '💬', label: '커뮤니티' },
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
      {ITEMS.map((it) => (
        <button
          key={it.key}
          className={view === it.key ? 'active' : ''}
          onClick={() => onChange(it.key)}
        >
          <span className="ni">{it.icon}</span>
          {it.label}
        </button>
      ))}
    </nav>
  )
}
