import type { HskLevel } from '../types'
import { LEVELS, wordsByLevel } from '../data/hsk'
import { useApp, useStats } from '../context/AppContext'
import { levelColor, levelLabel } from '../lib/levels'

export default function Dashboard({
  onLearn,
  onQuiz,
  onProduce,
  onCloze,
  onFavorites,
  onProfile,
}: {
  onLearn: (level?: HskLevel) => void
  onQuiz: (level?: HskLevel) => void
  onProduce: (level?: HskLevel) => void
  onCloze: (level?: HskLevel) => void
  onFavorites: () => void
  onProfile: () => void
}) {
  const { progress } = useApp()
  const stats = useStats()
  const goalPct = Math.min(100, Math.round((progress.todayCount / progress.dailyGoal) * 100))

  return (
    <div className="view">
      <div
        className="row-between"
        style={{ marginBottom: 14 }}
      >
        <div>
          <div className="small">
            안녕하세요{progress.streak > 0 ? `, ${progress.streak}일째 학습 중 🔥` : '!'}
          </div>
          <h2 style={{ fontSize: 22, marginTop: 2 }}>오늘도 加油! 加油(jiāyóu) 화이팅!</h2>
        </div>
        <button onClick={onProfile} style={{ fontSize: 24 }} aria-label="프로필">
          ⚙️
        </button>
      </div>

      <div className="hero">
        <div className="cn">今日目标</div>
        <p>
          오늘의 목표 · {progress.todayCount} / {progress.dailyGoal} 카드
        </p>
        <div className="progress-ring">
          <span style={{ width: `${goalPct}%` }} />
        </div>
        <button
          className="btn full"
          style={{
            marginTop: 16,
            background: '#fff',
            color: 'var(--brand-dark)',
          }}
          onClick={() => onLearn()}
        >
          {stats.due > 0 ? `🎴 복습 시작 (${stats.due}개 대기)` : '🎴 오늘 학습 시작'}
        </button>
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <div className="num">{stats.seen}</div>
          <div className="lbl">학습한 단어</div>
        </div>
        <div className="card stat">
          <div className="num">{stats.mastered}</div>
          <div className="lbl">마스터</div>
        </div>
        <div className="card stat">
          <div className="num">{progress.xp}</div>
          <div className="lbl">총 XP</div>
        </div>
      </div>

      <div className="section-title">바로 학습하기</div>
      <div className="action-grid">
        <button className="action" onClick={() => onLearn()}>
          <div className="ico">🎴</div>
          <div className="t">플래시카드</div>
          <div className="d">간격 반복으로 암기</div>
        </button>
        <button className="action" onClick={() => onQuiz()}>
          <div className="ico">✏️</div>
          <div className="t">퀴즈</div>
          <div className="d">4지선다 실력 점검</div>
        </button>
        <button className="action" onClick={() => onProduce()}>
          <div className="ico">⌨️</div>
          <div className="t">생산 퀴즈</div>
          <div className="d">병음 직접 입력 (회상↑)</div>
        </button>
        <button className="action" onClick={() => onCloze()}>
          <div className="ico">📝</div>
          <div className="t">빈칸 채우기</div>
          <div className="d">예문 맥락 학습</div>
        </button>
        <button className="action" onClick={onFavorites}>
          <div className="ico">⭐</div>
          <div className="t">즐겨찾기 복습</div>
          <div className="d">저장한 단어만</div>
        </button>
        <button className={`action ${stats.due > 0 ? 'due' : ''}`} onClick={() => onLearn()}>
          <div className="ico">⏰</div>
          <div className="t">복습 대기 {stats.due}</div>
          <div className="d">오늘 복습할 단어</div>
        </button>
      </div>

      <div className="section-title">HSK 레벨별 학습</div>
      <div className="card">
        {LEVELS.map((lv) => {
          const total = wordsByLevel(lv).length
          const learned = wordsByLevel(lv).filter(
            (w) => (progress.cards[w.id]?.box ?? 0) >= 1,
          ).length
          const pct = total ? Math.round((learned / total) * 100) : 0
          return (
            <div key={lv} className="level-row" onClick={() => onLearn(lv)} style={{ cursor: 'pointer' }}>
              <div className="level-badge" style={{ background: levelColor(lv) }}>
                {lv}급
              </div>
              <div className="meta">
                <div className="nm">{levelLabel(lv)}</div>
                <div className="bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="cnt">
                {learned}/{total}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
