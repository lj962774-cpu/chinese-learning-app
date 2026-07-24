import { useMemo, useState } from 'react'
import type { Kana, KanaScript } from './types'
import { kanaBy } from './data'
import { buildJpQueue, shuffle } from './jpSession'
import { useJp } from './JpContext'
import { speakJa } from '../lib/speech'

type Dir = 'k2r' | 'r2k' // 가나→로마자 / 로마자→가나

// 가나 인식 퀴즈: 가나를 보고 로마자 고르기(또는 반대). 4지선다.
export default function KanaQuiz({ onDone }: { onDone: () => void }) {
  const { progress, reviewCard } = useJp()
  const [script, setScript] = useState<KanaScript>('hira')
  const [dir, setDir] = useState<Dir>('k2r')
  // 스크립트가 바뀌면 새 라운드로 재구성
  const [round, setRound] = useState(0)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)

  const pool = useMemo(() => kanaBy(script), [script])
  const queue = useMemo(
    () => buildJpQueue(kanaBy(script), progress, 15),
    // 라운드/스크립트 변경 시에만 재구성
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [script, round],
  )

  const k = queue[idx]

  const options = useMemo(() => {
    if (!k) return []
    const others = shuffle(pool.filter((x) => x.romaji !== k.romaji)).slice(0, 3)
    return shuffle([k, ...others])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k?.id, dir])

  function changeScript(s: KanaScript) {
    if (s === script) return
    setScript(s)
    setRound((r) => r + 1)
    setIdx(0)
    setPicked(null)
    setCorrect(0)
  }

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
          <div className="grade-row" style={{ marginTop: 20 }}>
            <button
              className="btn ghost"
              onClick={() => {
                setRound((r) => r + 1)
                setIdx(0)
                setPicked(null)
                setCorrect(0)
              }}
            >
              한 번 더
            </button>
            <button className="btn primary" onClick={onDone}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  const answer = dir === 'k2r' ? k.romaji : k.kana
  function label(opt: Kana): string {
    return dir === 'k2r' ? opt.romaji : opt.kana
  }

  function pick(opt: Kana) {
    if (picked) return
    const ok = opt.romaji === k.romaji
    setPicked(opt.romaji)
    if (ok) setCorrect((c) => c + 1)
    reviewCard(k.id, ok)
    speakJa(k.kana)
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

      <div className="seg">
        <button className={script === 'hira' ? 'on' : ''} onClick={() => changeScript('hira')}>
          히라가나 あ
        </button>
        <button className={script === 'kata' ? 'on' : ''} onClick={() => changeScript('kata')}>
          가타카나 ア
        </button>
      </div>

      <div className="seg" style={{ marginTop: 8, marginBottom: 8 }}>
        <button className={dir === 'k2r' ? 'on' : ''} onClick={() => setDir('k2r')}>
          가나 → 로마자
        </button>
        <button className={dir === 'r2k' ? 'on' : ''} onClick={() => setDir('r2k')}>
          로마자 → 가나
        </button>
      </div>

      <div className="quiz-q">
        <div
          className={dir === 'k2r' ? 'kana-big' : 'pinyin'}
          style={dir === 'r2k' ? { fontSize: 40 } : undefined}
        >
          {dir === 'k2r' ? k.kana : k.romaji}
        </div>
        <div className="small">
          {dir === 'k2r' ? '이 가나의 발음은?' : '이 발음의 가나는?'}
        </div>
      </div>

      <div className="opt-grid">
        {options.map((opt) => {
          const isAns = opt.romaji === k.romaji
          const cls = picked
            ? isAns
              ? 'opt correct'
              : opt.romaji === picked
                ? 'opt wrong'
                : 'opt'
            : 'opt'
          return (
            <button key={opt.id} className={cls} onClick={() => pick(opt)} disabled={!!picked}>
              {label(opt)}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="center small" style={{ marginTop: 14 }}>
          정답: <b>{answer}</b> ({dir === 'k2r' ? k.kana : k.romaji})
        </div>
      )}
    </div>
  )
}
