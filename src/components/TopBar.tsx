import { useApp } from '../context/AppContext'
import Icon from './Icon'

export default function TopBar() {
  const { progress } = useApp()
  return (
    <div className="topbar">
      <h1>
        <span className="logo">汉语通</span> <span className="small">중국어 학습</span>
      </h1>
      <div className="chips">
        <span className="chip fire" title="연속 학습일" aria-label={`연속 ${progress.streak}일`}>
          <Icon name="flame" size={15} /> {progress.streak}
        </span>
        <span className="chip xp" title="누적 XP" aria-label={`누적 XP ${progress.xp}`}>
          <Icon name="star" size={15} /> {progress.xp}
        </span>
      </div>
    </div>
  )
}
