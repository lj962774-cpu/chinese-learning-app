import { useMemo, useState } from 'react'
import type { JpWord } from './types'
import { JP_WORDS, jpDisplay } from './data'
import { buildJpQueue, shuffle } from './jpSession'
import { useJp } from './JpContext'
import { speakJa } from '../lib/speech'

// N5 단어 퀴즈: 단어(한자·가나)를 보고 뜻 고르기. 4지선다.
export default function JpQuiz({ onDone }: { onDone: () => void }) {
  const { progress, reviewCard } = useJp()
  const [queue] = useState(() => buildJpQueue(JP_WORDS, progress, 15))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)

  const w = queue[idx]

  const options = useMemo(() => {
    if (!w) return []
    const others = shuffle(JP_WORDS.filter((x) => x.id !== w.id)).slice(0, 3)
    return shuffle([w, ...others])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w?.id])

  if (queue.length === 0 || idx >= queue.length) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">🎉</div>
          <h2>퀴즈 완료!</h2>
          {queue.length > 0 && (
            <p>
              {queue.length}문제 중 <b>{correct}</b>개 정답 (
              {Math.round((correct / queue.length) * 100)}%)
            </p>
          )}
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            홈으로
          </button>
        </div>
      </div>
    )
  }

  function pick(opt: JpWord) {
    if (picked) return
    const ok = opt.id === w.id
    setPicked(opt.id)
    if (ok) setCorrect((c) => c + 1)
    reviewCard(w.id, ok)
    speakJa(w.kanji ?? w.kana)
    setTimeout(() => {
      setPicked(null)
      setIdx((i) => i + 1)
    }, 850)
  }

  return (
    <div className="view">
      <div className="flash-top">
        <button className="small" onClick={onDone} style={{ fontWeight: 700 }}>
          ← 나가기
        </button>
        <span>
          {idx + 1} / {queue.length}
        </span>
      </div>

      <div className="quiz-q">
        <div className="jp-word">{jpDisplay(w)}</div>
        <div className="small">{w.romaji} · 이 단어의 뜻은?</div>
      </div>

      <div>
        {options.map((opt) => {
          const isAns = opt.id === w.id
          const cls = picked
            ? isAns
              ? 'opt correct'
              : opt.id === picked
                ? 'opt wrong'
                : 'opt'
            : 'opt'
          return (
            <button key={opt.id} className={cls} onClick={() => pick(opt)} disabled={!!picked}>
              {opt.meaning}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="center small" style={{ marginTop: 14 }}>
          정답: <b>{w.meaning}</b>
        </div>
      )}
    </div>
  )
}
