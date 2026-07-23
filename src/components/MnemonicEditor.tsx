import { useState } from 'react'
import { useApp } from '../context/AppContext'

// 연상 암기(키워드법 + 이중부호화): 단어에 나만의 연상 메모와 이모지를 붙인다.
// 모국어 발음 유사 키워드 + 시각 단서가 기억을 크게 강화한다는 연구에 근거.
const EMOJIS = ['💡', '🐶', '🍎', '❤️', '🔥', '🌙', '🚗', '🏠', '👀', '🎵', '💧', '⭐']

export default function MnemonicEditor({ wordId }: { wordId: string }) {
  const { progress, setMnemonic } = useApp()
  const saved = progress.mnemonics[wordId]
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(saved?.text ?? '')
  const [emoji, setEmoji] = useState(saved?.emoji ?? '')

  if (!editing) {
    return saved ? (
      <div
        className="example"
        style={{ cursor: 'pointer', borderLeft: '3px solid var(--gold)' }}
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      >
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>💭 내 연상</div>
        <div>
          {saved.emoji && <span style={{ fontSize: 20 }}>{saved.emoji} </span>}
          {saved.text}
        </div>
      </div>
    ) : (
      <button
        className="small"
        style={{ marginTop: 6, textDecoration: 'underline' }}
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      >
        💭 연상 메모 추가
      </button>
    )
  }

  return (
    <div
      className="example"
      style={{ textAlign: 'left' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pill-select" style={{ marginBottom: 8 }}>
        {EMOJIS.map((em) => (
          <button
            key={em}
            className={emoji === em ? 'sel' : ''}
            style={{ padding: '4px 8px' }}
            onClick={() => setEmoji(emoji === em ? '' : em)}
          >
            {em}
          </button>
        ))}
      </div>
      <input
        placeholder="예: 발음이 '마마'→엄마 (연상 키워드)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <div className="grade-row" style={{ marginTop: 8 }}>
        <button
          className="btn ghost"
          style={{ padding: 10 }}
          onClick={() => { setText(saved?.text ?? ''); setEmoji(saved?.emoji ?? ''); setEditing(false) }}
        >
          취소
        </button>
        <button
          className="btn right"
          style={{ padding: 10 }}
          onClick={() => { setMnemonic(wordId, text, emoji); setEditing(false) }}
        >
          저장
        </button>
      </div>
    </div>
  )
}
