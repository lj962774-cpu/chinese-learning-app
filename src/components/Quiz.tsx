import { useState } from 'react'
import type { HskLevel, Word } from '../types'
import { useApp } from '../context/AppContext'
import { WORDS, wordsByLevel } from '../data/hsk'
import { levelLabel } from '../lib/levels'
import { speak, speechSupported } from '../lib/speech'
import Icon from './Icon'

interface Question {
  word: Word
  options: string[]
  answer: string
}

function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

function makeQuiz(level?: HskLevel, size = 10): Question[] {
  const pool = level ? wordsByLevel(level) : WORDS
  const chosen = pick(pool, Math.min(size, pool.length))
  return chosen.map((word) => {
    const distractors = pick(
      WORDS.filter((w) => w.id !== word.id).map((w) => w.meaning),
      3,
    )
    const options = pick([word.meaning, ...distractors], 4)
    return { word, options, answer: word.meaning }
  })
}

export default function Quiz({
  level,
  onDone,
}: {
  level?: HskLevel
  onDone: () => void
}) {
  const { reviewWord } = useApp()
  const [quiz] = useState(() => makeQuiz(level))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const q = quiz[idx]

  if (idx >= quiz.length) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h2>퀴즈 완료!</h2>
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
    const ok = opt === q.answer
    setPicked(opt)
    if (ok) setScore((s) => s + 1)
    reviewWord(q.word.id, ok)
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
        <div className="big">{q.word.hanzi}</div>
        <div className="py">{q.word.pinyin}</div>
        {speechSupported() && (
          <button
            className="speak-btn"
            style={{ margin: '14px auto 0' }}
            onClick={() => speak(q.word.hanzi)}
            aria-label="발음 듣기"
          >
            <Icon name="speaker" size={20} />
          </button>
        )}
      </div>

      <div>
        {q.options.map((opt) => {
          let cls = 'opt'
          if (picked) {
            if (opt === q.answer) cls += ' correct'
            else if (opt === picked) cls += ' wrong'
          }
          return (
            <button
              key={opt}
              className={cls}
              disabled={!!picked}
              onClick={() => choose(opt)}
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
