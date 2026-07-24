import type { KanaScript } from './types'
import { JP_WORDS, KANA, kanaBy } from './data'
import { useJp } from './JpContext'
import { LangSwitch } from '../lang'

// 일본어 홈: 가나(히라가나·가타카나) 진도 + N5 단어 진도 + 학습 진입.
export default function JpDashboard({
  onKanaChart,
  onKanaLearn,
  onKanaQuiz,
  onVocab,
  onVocabQuiz,
}: {
  onKanaChart: () => void
  onKanaLearn: (script: KanaScript) => void
  onKanaQuiz: () => void
  onVocab: () => void
  onVocabQuiz: () => void
}) {
  const { progress } = useJp()

  const learnedCount = (ids: { id: string }[]) =>
    ids.filter((x) => (progress.cards[x.id]?.box ?? 0) >= 1).length

  const hira = kanaBy('hira')
  const kata = kanaBy('kata')
  const hiraLearned = learnedCount(hira)
  const kataLearned = learnedCount(kata)
  const vocabLearned = learnedCount(JP_WORDS)
  const kanaLearned = KANA.filter((k) => (progress.cards[k.id]?.box ?? 0) >= 1).length

  return (
    <div className="view">
      <LangSwitch />

      <div className="row-between" style={{ marginTop: 12, marginBottom: 12 }}>
        <div>
          <div className="small">
            {progress.streak > 0 ? `${progress.streak}일째 학습 중 🔥` : 'こんにちは!'}
          </div>
          <h2 style={{ fontSize: 22, marginTop: 2 }}>일본어, 가나부터 차근차근 📖</h2>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <div className="num">{kanaLearned}</div>
          <div className="lbl">익힌 가나</div>
        </div>
        <div className="card stat">
          <div className="num">{vocabLearned}</div>
          <div className="lbl">익힌 단어</div>
        </div>
        <div className="card stat">
          <div className="num">{progress.xp}</div>
          <div className="lbl">총 XP</div>
        </div>
      </div>

      <div className="section-title">가나 (히라가나·가타카나)</div>
      <div className="card">
        <div className="kana-prog">
          <div className="kp-row">
            <span className="kp-name">히라가나 あ</span>
            <div className="bar"><span style={{ width: `${Math.round((hiraLearned / hira.length) * 100)}%` }} /></div>
            <span className="cnt">{hiraLearned}/{hira.length}</span>
          </div>
          <div className="kp-row">
            <span className="kp-name">가타카나 ア</span>
            <div className="bar"><span style={{ width: `${Math.round((kataLearned / kata.length) * 100)}%` }} /></div>
            <span className="cnt">{kataLearned}/{kata.length}</span>
          </div>
        </div>
      </div>

      <div className="action-grid" style={{ marginTop: 12 }}>
        <button className="action" onClick={onKanaChart}>
          <div className="ico">📋</div>
          <div className="t">가나표</div>
          <div className="d">전체 표 + 발음 듣기</div>
        </button>
        <button className="action" onClick={onKanaQuiz}>
          <div className="ico">✏️</div>
          <div className="t">가나 퀴즈</div>
          <div className="d">가나 ↔ 로마자</div>
        </button>
        <button className="action" onClick={() => onKanaLearn('hira')}>
          <div className="ico">🎴</div>
          <div className="t">히라가나 학습</div>
          <div className="d">플래시카드 + 예시</div>
        </button>
        <button className="action" onClick={() => onKanaLearn('kata')}>
          <div className="ico">🎴</div>
          <div className="t">가타카나 학습</div>
          <div className="d">플래시카드 + 예시</div>
        </button>
      </div>

      <div className="section-title">N5 기초 단어 (예문 학습)</div>
      <div className="card">
        <div className="level-row">
          <div className="level-badge" style={{ background: '#0ea5e9' }}>N5</div>
          <div className="meta">
            <div className="nm">필수 기초 단어 · 예문 포함</div>
            <div className="bar">
              <span style={{ width: `${Math.round((vocabLearned / JP_WORDS.length) * 100)}%` }} />
            </div>
          </div>
          <div className="cnt">{vocabLearned}/{JP_WORDS.length}</div>
        </div>
      </div>

      <div className="action-grid" style={{ marginTop: 12 }}>
        <button className="action" onClick={onVocab}>
          <div className="ico">🎴</div>
          <div className="t">단어 학습</div>
          <div className="d">예문과 함께 암기</div>
        </button>
        <button className="action" onClick={onVocabQuiz}>
          <div className="ico">✏️</div>
          <div className="t">단어 퀴즈</div>
          <div className="d">4지선다 뜻 맞히기</div>
        </button>
      </div>

      <p className="small center" style={{ marginTop: 18, opacity: 0.7 }}>
        발음은 기기의 일본어 음성으로 재생됩니다.
      </p>
    </div>
  )
}
