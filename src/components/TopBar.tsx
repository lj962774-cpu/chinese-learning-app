import { useApp } from '../context/AppContext'

export default function TopBar() {
  const { progress } = useApp()
  return (
    <div className="topbar">
      <h1>
        <span className="logo">汉语通</span> <span className="small">중국어 학습</span>
      </h1>
      <div className="chips">
        <span className="chip fire" title="연속 학습일">
          🔥 {progress.streak}
        </span>
        <span className="chip xp" title="누적 XP">
          ⭐ {progress.xp}
        </span>
      </div>
    </div>
  )
}
