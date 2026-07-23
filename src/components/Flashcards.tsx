import { useEffect, useState } from 'react'
import type { HskLevel } from '../types'
import { useApp } from '../context/AppContext'
import { buildQueue } from '../lib/session'
import { speak, speechSupported } from '../lib/speech'
import { levelLabel } from '../lib/levels'
import MnemonicEditor from './MnemonicEditor'

export default function Flashcards({
  level,
  onlyFavorites,
  onDone,
}: {
  level?: HskLevel
  onlyFavorites?: boolean
  onDone: () => void
}) {
  const { progress, settings, reviewWord } = useApp()
  // 세션 시작 시점의 큐를 고정(이후 progress 변경으로 재구성되지 않도록)
  const [queue] = useState(() =>
    buildQueue(progress, { level, onlyFavorites, size: 20 }),
  )
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)

  const word = queue[idx]
  const meaningFirst = settings.showMeaningFirst

  useEffect(() => {
    if (flipped && settings.autoSpeak && word) speak(word.hanzi)
  }, [flipped, settings.autoSpeak, word])

  if (queue.length === 0) {
    return (
      <div className="view">
        <div className="card done-card">
          <div className="em">✅</div>
          <h2>복습할 카드가 없어요</h2>
          <p>
            {onlyFavorites
              ? '즐겨찾기한 단어가 없습니다.'
              : '지금은 복습 예정 단어가 없습니다. 나중에 다시 오면 딱 맞는 타이밍에 복습할 수 있어요!'}
          </p>
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
          <p className="star" style={{ marginTop: 6 }}>
            +{correct * 10} XP 획득
          </p>
          <button className="btn primary full" style={{ marginTop: 20 }} onClick={onDone}>
            홈으로
          </button>
        </div>
      </div>
    )
  }

  function grade(ok: boolean) {
    if (!word) return
    reviewWord(word.id, ok)
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
            {idx + 1} / {queue.length}
            {level ? ` · ${levelLabel(level)}` : ''}
          </span>
        </div>

        <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
          {!flipped ? (
            meaningFirst ? (
              <>
                <div className="meaning">{word.meaning}</div>
                {word.pos && <div className="pos">{word.pos}</div>}
                <div className="tap-hint">탭하여 한자 보기</div>
              </>
            ) : (
              <>
                <div className="hanzi">{word.hanzi}</div>
                {settings.showPinyin && <div className="pinyin">{word.pinyin}</div>}
                <div className="tap-hint">탭하여 뜻 보기</div>
              </>
            )
          ) : (
            <>
              <div className="hanzi">{word.hanzi}</div>
              <div className="pinyin">{word.pinyin}</div>
              <div className="meaning" style={{ fontSize: 22 }}>
                {word.meaning}
              </div>
              {word.en && word.en !== word.meaning && (
                <div className="small" style={{ maxWidth: 320 }}>
                  {word.en}
                </div>
              )}
              {word.pos && <div className="pos">{word.pos}</div>}
              {speechSupported() && (
                <button
                  className="speak-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(word.hanzi)
                  }}
                  aria-label="발음 듣기"
                >
                  🔊
                </button>
              )}
              {word.example && (
                <div className="example">
                  <div>{word.example.hanzi}</div>
                  <div className="ex-py">{word.example.pinyin}</div>
                  <div className="ex-mn">{word.example.meaning}</div>
                </div>
              )}
              <MnemonicEditor wordId={word.id} />
            </>
          )}
        </div>

        {flipped ? (
          <div className="grade-row">
            <button className="btn wrong" onClick={() => grade(false)}>
              ✗ 또 볼래요
            </button>
            <button className="btn right" onClick={() => grade(true)}>
              ✓ 외웠어요
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
