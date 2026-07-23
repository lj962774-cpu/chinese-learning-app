import { useState } from 'react'
import type { HskLevel, Word } from '../types'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/hsk'
import { buildQueue } from '../lib/session'
import { speak, speechSupported } from '../lib/speech'
import { levelLabel } from '../lib/levels'

// 빈칸 채우기(cloze): 예문에서 목표 단어를 비우고 문맥으로 알맞은 단어를 고른다.
// 맥락 속 인출은 어휘를 실제 사용과 연결해 기억을 강화한다.
interface Q {
  word: Word
  options: string[] // 한자 보기
  parts: [string, string] // 빈칸 앞/뒤 문장 조각
}

function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

function makeQuestions(words: Word[]): Q[] {
  return words
    .filter((w) => w.example && w.example.hanzi.includes(w.hanzi))
    .map((w) => {
      const idx = w.example!.hanzi.indexOf(w.hanzi)
      const parts: [string, string] = [
        w.example!.hanzi.slice(0, idx),
        w.example!.hanzi.slice(idx + w.hanzi.length),
      ]
      // 방해 보기: 같은 급수에서 길이가 같은 다른 단어 우선
      let distractPool = WORDS.filter(
        (x) => x.level === w.level && x.hanzi !== w.hanzi && x.hanzi.length === w.hanzi.length,
      )
      if (distractPool.length < 3) {
        distractPool = WORDS.filter((x) => x.hanzi !== w.hanzi && x.hanzi.length === w.hanzi.length)
      }
      const distractors = pick(distractPool, 3).map((x) => x.hanzi)
      const options = pick([w.hanzi, ...distractors], 4)
      return { word: w, options, parts }
    })
}

export default function Cloze({
  level,
  onDone,
}: {
  level?: HskLevel
  onDone: () => void
}) {
  const { progress, reviewWord, settings } = useApp()
  const [quiz] = useState(() =>
    makeQuestions(buildQueue(progress, { level, onlyExamples: true, size: 12 })),
  )
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const q = quiz[idx]

  if (quiz.length === 0) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">📝</div>
          <h2>빈칸 문제가 없어요</h2>
          <p>예문이 있는 단어로 만들어져요. 지금은 복습 예정 단어 중 예문이 있는 게 없네요. HSK 1급으로 연습해 보세요!</p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (idx >= quiz.length) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h2>빈칸 채우기 완료!</h2>
          <p>
            {quiz.length}문제 중 <b>{score}</b>개 정답 ({pct}%)
          </p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            홈으로
          </button>
        </div>
      </div>
    )
  }

  function choose(opt: string) {
    if (picked) return
    const ok = opt === q.word.hanzi
    setPicked(opt)
    if (ok) setScore((s) => s + 1)
    reviewWord(q.word.id, ok)
    if (settings.autoSpeak) speak(q.word.example!.hanzi)
  }

  function next() {
    setPicked(null)
    setIdx((i) => i + 1)
  }

  return (
    <div className="view">
      <div className="flash-top">
        <button className="small" onClick={onDone} style={{ fontWeight: 700 }}>
          ← 나가기
        </button>
        <span>
          {idx + 1} / {quiz.length}
          {level ? ` · ${levelLabel(level)}` : ''}
        </span>
      </div>

      <div className="quiz-q">
        <div className="small" style={{ marginBottom: 10 }}>빈칸에 알맞은 단어는?</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.6 }}>
          {q.parts[0]}
          <span
            style={{
              color: picked ? 'var(--green)' : 'var(--brand)',
              borderBottom: '2px solid currentColor',
              padding: '0 10px',
            }}
          >
            {picked ? q.word.hanzi : '____'}
          </span>
          {q.parts[1]}
        </div>
        <div className="ex-mn" style={{ marginTop: 10, fontSize: 14 }}>
          {q.word.example!.meaning}
        </div>
        {picked && (
          <>
            <div className="py" style={{ marginTop: 6 }}>{q.word.example!.pinyin}</div>
            {speechSupported() && (
              <button
                className="speak-btn"
                style={{ margin: '10px auto 0' }}
                onClick={() => speak(q.word.example!.hanzi)}
                aria-label="발음 듣기"
              >
                🔊
              </button>
            )}
          </>
        )}
      </div>

      <div>
        {q.options.map((opt) => {
          let cls = 'opt'
          if (picked) {
            if (opt === q.word.hanzi) cls += ' correct'
            else if (opt === picked) cls += ' wrong'
          }
          return (
            <button
              key={opt}
              className={cls}
              disabled={!!picked}
              onClick={() => choose(opt)}
              style={{ textAlign: 'center', fontSize: 22, fontWeight: 700 }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {picked && (
        <button className="btn primary full" onClick={next}>
          {idx + 1 === quiz.length ? '결과 보기' : '다음 문제'}
        </button>
      )}
    </div>
  )
}
