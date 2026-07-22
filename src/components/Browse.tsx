import { useMemo, useState } from 'react'
import type { HskLevel } from '../types'
import { LEVELS, WORDS, wordsByLevel } from '../data/hsk'
import { useApp } from '../context/AppContext'
import { levelColor, levelLabel } from '../lib/levels'
import { mastery } from '../lib/srs'
import { speak, speechSupported } from '../lib/speech'

type Filter = HskLevel | 'fav'

export default function Browse() {
  const { progress, settings, toggleFavorite } = useApp()
  const [filter, setFilter] = useState<Filter>(1)
  const [query, setQuery] = useState('')

  const words = useMemo(() => {
    let list =
      filter === 'fav'
        ? WORDS.filter((w) => progress.favorites.includes(w.id))
        : wordsByLevel(filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (w) =>
          w.hanzi.includes(q) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          (w.en?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  }, [filter, query, progress.favorites])

  const LIMIT = 200
  const shown = words.slice(0, LIMIT)
  const truncated = words.length - shown.length

  return (
    <div className="view">
      <div className="topbar" style={{ padding: 0, marginBottom: 12 }}>
        <h1>단어장</h1>
        <span className="small">총 {WORDS.length}단어</span>
      </div>

      <input
        placeholder="한자·병음·뜻 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="pill-select" style={{ marginTop: 12 }}>
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={filter === lv ? 'sel' : ''}
            onClick={() => setFilter(lv)}
          >
            {levelLabel(lv)}
          </button>
        ))}
        <button
          className={filter === 'fav' ? 'sel' : ''}
          onClick={() => setFilter('fav')}
        >
          ⭐ 즐겨찾기
        </button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {words.length === 0 ? (
          <div className="center">
            <div className="em">🔍</div>
            <p>단어가 없습니다.</p>
          </div>
        ) : (
          shown.map((w) => {
            const card = progress.cards[w.id]
            const m = card ? mastery(card) : 0
            const fav = progress.favorites.includes(w.id)
            return (
              <div key={w.id} className="level-row">
                <div
                  className="level-badge"
                  style={{
                    background: levelColor(w.level),
                    width: 52,
                    height: 52,
                    fontSize: 22,
                  }}
                >
                  {w.hanzi.length > 2 ? w.hanzi.slice(0, 1) : w.hanzi}
                </div>
                <div className="meta">
                  <div className="nm">
                    {w.hanzi}{' '}
                    {settings.showPinyin && (
                      <span style={{ color: 'var(--brand)', fontWeight: 600 }}>
                        {w.pinyin}
                      </span>
                    )}
                  </div>
                  <div className="small">
                    {w.meaning}
                    {w.pos ? ` · ${w.pos}` : ''}
                  </div>
                  <div className="bar" style={{ marginTop: 6 }}>
                    <span style={{ width: `${m * 100}%` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {speechSupported() && (
                    <button
                      onClick={() => speak(w.hanzi)}
                      aria-label="발음"
                      style={{ fontSize: 20 }}
                    >
                      🔊
                    </button>
                  )}
                  <button
                    className={`fav-star ${fav ? 'on' : ''}`}
                    onClick={() => toggleFavorite(w.id)}
                    aria-label="즐겨찾기"
                  >
                    ★
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
      {truncated > 0 && (
        <p className="center small">
          {shown.length}개 표시 중 · {truncated}개 더 있음 — 검색으로 좁혀보세요
        </p>
      )}
    </div>
  )
}
