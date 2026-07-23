import { useApp, useStats } from '../context/AppContext'

function Toggle({
  on,
  onClick,
  label,
  desc,
}: {
  on: boolean
  onClick: () => void
  label: string
  desc?: string
}) {
  return (
    <div className="toggle-row">
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {desc && <div className="small">{desc}</div>}
      </div>
      <div className={`switch ${on ? 'on' : ''}`} onClick={onClick} role="switch" aria-checked={on} />
    </div>
  )
}

export default function Profile({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, progress, setDailyGoal, resetProgress } = useApp()
  const stats = useStats()

  return (
    <div className="view">
      <div className="topbar" style={{ padding: 0, marginBottom: 12 }}>
        <h1>프로필 · 설정</h1>
        <button className="small" style={{ fontWeight: 700 }} onClick={onBack}>
          ← 홈
        </button>
      </div>

      <div className="hero" style={{ background: 'linear-gradient(135deg,#334155,#0f172a)' }}>
        <div className="cn" style={{ fontSize: 26 }}>
          {settings.nickname.trim() || '학습자'} 님
        </div>
        <p>
          🔥 연속 {progress.streak}일 · ⭐ {progress.xp} XP · 🏆 마스터 {stats.mastered}개
        </p>
      </div>

      <div className="section-title">닉네임 (커뮤니티 표시 이름)</div>
      <input
        placeholder="닉네임을 입력하세요"
        value={settings.nickname}
        onChange={(e) => updateSettings({ nickname: e.target.value })}
      />

      <div className="section-title">하루 학습 목표</div>
      <div className="pill-select">
        {[10, 20, 30, 50].map((n) => (
          <button
            key={n}
            className={progress.dailyGoal === n ? 'sel' : ''}
            onClick={() => setDailyGoal(n)}
          >
            {n}개
          </button>
        ))}
      </div>

      <div className="section-title">학습 설정</div>
      <div className="card">
        <Toggle
          label="병음 표시"
          desc="카드·단어장에 병음을 함께 표시"
          on={settings.showPinyin}
          onClick={() => updateSettings({ showPinyin: !settings.showPinyin })}
        />
        <Toggle
          label="뜻 먼저 보기"
          desc="한국어 뜻을 먼저 보고 한자를 떠올리기"
          on={settings.showMeaningFirst}
          onClick={() => updateSettings({ showMeaningFirst: !settings.showMeaningFirst })}
        />
        <Toggle
          label="자동 발음 재생"
          desc="카드를 뒤집으면 발음을 자동 재생"
          on={settings.autoSpeak}
          onClick={() => updateSettings({ autoSpeak: !settings.autoSpeak })}
        />
      </div>

      <div className="section-title">학습 원리 (연구 기반)</div>
      <div className="card" style={{ padding: 16 }}>
        <p className="small" style={{ lineHeight: 1.7 }}>
          이 앱은 어휘 학습 연구에서 효과가 검증된 방법을 따릅니다:
        </p>
        <ul className="small" style={{ lineHeight: 1.8, paddingLeft: 18, marginTop: 6 }}>
          <li>
            🎴 <b>간격 반복</b> — 잊을 때쯤 다시 복습 (간격이 점점 늘어남)
          </li>
          <li>
            ⌨️ <b>인출·산출 연습</b> — 보기만 하지 않고 직접 떠올려 입력 (재인보다 회상이 효과적)
          </li>
          <li>
            💭 <b>연상 암기 + 이미지</b> — 나만의 키워드·이모지로 이중부호화 (회상률 크게 향상)
          </li>
          <li>
            🔊 <b>발음·예문</b> — 소리와 맥락을 함께 학습
          </li>
        </ul>
      </div>

      <div className="section-title">데이터</div>
      <div className="card" style={{ padding: 16 }}>
        <p className="small" style={{ marginBottom: 12 }}>
          학습 기록과 설정은 이 브라우저에 저장됩니다. 초기화하면 되돌릴 수 없어요.
        </p>
        <button
          className="btn ghost full"
          onClick={() => {
            if (confirm('모든 학습 기록을 초기화할까요?')) resetProgress()
          }}
        >
          학습 기록 초기화
        </button>
      </div>

      <p className="center small" style={{ marginTop: 20 }}>
        汉语通 · HSK 중국어 학습 · v0.1
      </p>
    </div>
  )
}
