import { useEffect, useState } from 'react'
import type { KanaGroup, KanaScript } from './types'
import { kanaBy } from './data'
import { buildJpQueue } from './jpSession'
import { useJp } from './JpContext'
import { speakJa, speechSupported } from '../lib/speech'
import Icon from '../components/Icon'

// 가나 플래시카드: 가나 → 로마자·예시. 간격 반복(SRS)으로 채점.
export default function KanaLearn({
  script,
  group,
  onDone,
}: {
  script: KanaScript
  group?: KanaGroup
  onDone: () => void
}) {
  const { progress, reviewCard } = useJp()
  const [queue] = useState(() => buildJpQueue(kanaBy(script, group), progress, 20))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)

  const k = queue[idx]

  useEffect(() => {
    if (flipped && k) speakJa(k.kana)
  }, [flipped, k])

  if (queue.length === 0) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">✅</div>
          <h2>학습할 가나가 없어요</h2>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (idx >= queue.length) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">🎉</div>
          <h2>세션 완료!</h2>
          <p>
            {queue.length}개 중 <b>{correct}</b>개를 맞혔어요 (
            {Math.round((correct / queue.length) * 100)}%)
          </p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            홈으로
          </button>
        </div>
      </div>
    )
  }

  function grade(ok: boolean) {
    if (!k) return
    reviewCard(k.id, ok)
    if (ok) setCorrect((c) => c + 1)
    setFlipped(false)
    setIdx((i) => i + 1)
  }

  return (
    <div className="view">
      <div className="flash-wrap">
        <div className="flash-top">
          <button className="small" onClick={onDone} style={{ fontWeight: 700 }}>
            ← 나가기
          </button>
          <span>
            {idx + 1} / {queue.length} · {script === 'hira' ? '히라가나' : '가타카나'}
          </span>
        </div>

        <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
          <div className="fc-face" key={flipped ? 'back' : 'front'}>
          {!flipped ? (
            <>
              <div className="kana-big">{k.kana}</div>
              <div className="tap-hint">탭하여 읽는 법 보기</div>
            </>
          ) : (
            <>
              <div className="kana-big">{k.kana}</div>
              <div className="pinyin" style={{ fontSize: 28 }}>{k.romaji}</div>
              {speechSupported() && (
                <button
                  className="speak-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    speakJa(k.kana)
                  }}
                  aria-label="발음 듣기"
                >
                  <Icon name="speaker" size={20} />
                </button>
              )}
              {k.ex && (
                <div className="example">
                  <div style={{ fontSize: 20 }}>{k.ex.word}</div>
                  <div className="ex-py">{k.ex.reading}</div>
                  <div className="ex-mn">{k.ex.meaning}</div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {flipped ? (
          <div className="grade-row">
            <button className="btn wrong" onClick={() => grade(false)}>
              <Icon name="close" size={18} /> 또 볼래요
            </button>
            <button className="btn right" onClick={() => grade(true)}>
              <Icon name="check" size={18} /> 외웠어요
            </button>
          </div>
        ) : (
          <button className="btn primary full" onClick={() => setFlipped(true)}>
            읽는 법 확인
          </button>
        )}
      </div>
    </div>
  )
}
