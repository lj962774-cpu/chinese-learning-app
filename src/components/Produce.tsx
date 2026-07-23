import { useEffect, useRef, useState } from 'react'
import type { HskLevel } from '../types'
import { useApp } from '../context/AppContext'
import { buildQueue } from '../lib/session'
import { pinyinMatches } from '../lib/pinyin'
import { speak, speechSupported } from '../lib/speech'
import { levelLabel } from '../lib/levels'

// 생산형(산출) 인출 연습: 뜻을 보고 병음을 직접 입력한다.
// 재인(4지선다)보다 회상·산출이 생산적 어휘 지식에 더 효과적이라는 연구에 근거.
export default function Produce({
  level,
  onDone,
}: {
  level?: HskLevel
  onDone: () => void
}) {
  const { progress, settings, reviewWord } = useApp()
  const [queue] = useState(() => buildQueue(progress, { level, size: 15 }))
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState<null | boolean>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const word = queue[idx]

  useEffect(() => {
    inputRef.current?.focus()
  }, [idx])

  if (queue.length === 0) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">✅</div>
          <h2>연습할 단어가 없어요</h2>
          <p>지금은 복습 예정 단어가 없습니다. 잠시 후 다시 오면 딱 맞는 타이밍에 복습할 수 있어요!</p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (idx >= queue.length) {
    const pct = Math.round((correctCount / queue.length) * 100)
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h2>생산 연습 완료!</h2>
          <p>
            {queue.length}개 중 <b>{correctCount}</b>개를 직접 맞혔어요 ({pct}%)
          </p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            홈으로
          </button>
        </div>
      </div>
    )
  }

  function check() {
    if (checked !== null || !word) return
    const ok = pinyinMatches(input, word.pinyin)
    setChecked(ok)
    if (ok) setCorrectCount((c) => c + 1)
    reviewWord(word.id, ok)
    if (settings.autoSpeak) speak(word.hanzi)
  }

  function next() {
    setInput('')
    setChecked(null)
    setIdx((i) => i + 1)
  }

  return (
    <div className="view">
      <div className="flash-top">
        <button className="small" onClick={onDone} style={{ fontWeight: 700 }}>
          ← 나가기
        </button>
        <span>
          {idx + 1} / {queue.length}
          {level ? ` · ${levelLabel(level)}` : ''}
        </span>
      </div>

      <div className="quiz-q">
        <div className="small" style={{ marginBottom: 8 }}>이 뜻의 병음을 입력하세요</div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>{word.meaning}</div>
        {checked !== null && (
          <>
            <div className="big" style={{ fontSize: 44, marginTop: 10 }}>{word.hanzi}</div>
            <div className="py">{word.pinyin}</div>
            {speechSupported() && (
              <button
                className="speak-btn"
                style={{ margin: '12px auto 0' }}
                onClick={() => speak(word.hanzi)}
                aria-label="발음 듣기"
              >
                🔊
              </button>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        placeholder="예: ni hao (성조 없이 입력해도 돼요)"
        value={input}
        disabled={checked !== null}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          if (checked === null) check()
          else next()
        }}
        style={{ textAlign: 'center', fontSize: 18 }}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      {checked !== null && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            fontWeight: 800,
            color: checked ? 'var(--green)' : 'var(--brand)',
          }}
        >
          {checked ? '✓ 정답!' : `✗ 정답: ${word.pinyin}`}
        </div>
      )}

      {checked === null ? (
        <div className="grade-row" style={{ marginTop: 14 }}>
          <button className="btn wrong" onClick={() => { setChecked(false); reviewWord(word.id, false); if (settings.autoSpeak) speak(word.hanzi) }}>
            모르겠어요
          </button>
          <button className="btn right" onClick={check}>
            확인
          </button>
        </div>
      ) : (
        <button className="btn primary full" style={{ marginTop: 14 }} onClick={next}>
          {idx + 1 === queue.length ? '결과 보기' : '다음'}
        </button>
      )}
    </div>
  )
}
