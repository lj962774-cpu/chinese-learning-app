import { useEffect, useState } from 'react'
import { JP_WORDS, jpDisplay } from './data'
import { buildJpQueue } from './jpSession'
import { useJp } from './JpContext'
import { speakJa, speechSupported } from '../lib/speech'
import Icon from '../components/Icon'

// N5 단어 플래시카드: 단어 → 읽기·뜻·예문. 간격 반복(SRS)으로 채점.
export default function JpFlashcards({ onDone }: { onDone: () => void }) {
  const { progress, reviewCard } = useJp()
  const [queue] = useState(() => buildJpQueue(JP_WORDS, progress, 20))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)

  const w = queue[idx]

  useEffect(() => {
    if (flipped && w) speakJa(w.kanji ?? w.kana)
  }, [flipped, w])

  if (queue.length === 0 || idx >= queue.length) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">🎉</div>
          <h2>세션 완료!</h2>
          {queue.length > 0 && (
            <p>
              {queue.length}개 중 <b>{correct}</b>개를 맞혔어요 (
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

  function grade(ok: boolean) {
    if (!w) return
    reviewCard(w.id, ok)
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
            {idx + 1} / {queue.length} · N5
          </span>
        </div>

        <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
          <div className="fc-face" key={flipped ? 'back' : 'front'}>
          {!flipped ? (
            <>
              <div className="jp-word">{jpDisplay(w)}</div>
              <div className="tap-hint">탭하여 읽기·뜻 보기</div>
            </>
          ) : (
            <>
              <div className="jp-word">{jpDisplay(w)}</div>
              {w.kanji && <div className="pinyin">{w.kana}</div>}
              <div className="pinyin" style={{ fontSize: 16 }}>{w.romaji}</div>
              <div className="meaning" style={{ fontSize: 22 }}>{w.meaning}</div>
              {speechSupported() && (
                <button
                  className="speak-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    speakJa(w.kanji ?? w.kana)
                  }}
                  aria-label="발음 듣기"
                >
                  <Icon name="speaker" size={20} />
                </button>
              )}
              {w.example && (
                <div className="example">
                  <div>{w.example.jp}</div>
                  <div className="ex-py">{w.example.reading}</div>
                  <div className="ex-mn">{w.example.meaning}</div>
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
            정답 확인
          </button>
        )}
      </div>
    </div>
  )
}
