import { useEffect, useState } from 'react'
import type { HskLevel } from './types'
import { AppProvider } from './context/AppContext'
import { LangProvider, useLang } from './lang'
import { warmUpVoices } from './lib/speech'
import JpApp from './jp/JpApp'
import TopBar from './components/TopBar'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import Flashcards from './components/Flashcards'
import Quiz from './components/Quiz'
import Produce from './components/Produce'
import Cloze from './components/Cloze'
import Browse from './components/Browse'
import Community from './components/Community'
import Profile from './components/Profile'

export type View =
  | 'home'
  | 'learn'
  | 'quiz'
  | 'produce'
  | 'cloze'
  | 'browse'
  | 'community'
  | 'profile'

function Shell() {
  const [view, setView] = useState<View>('home')
  const [focusLevel, setFocusLevel] = useState<HskLevel | undefined>(undefined)
  const [favMode, setFavMode] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    warmUpVoices()
  }, [])

  function startLearn(level?: HskLevel) {
    setFocusLevel(level)
    setFavMode(false)
    setSessionKey((k) => k + 1)
    setView('learn')
  }
  function startFavorites() {
    setFocusLevel(undefined)
    setFavMode(true)
    setSessionKey((k) => k + 1)
    setView('learn')
  }
  function startQuiz(level?: HskLevel) {
    setFocusLevel(level)
    setSessionKey((k) => k + 1)
    setView('quiz')
  }
  function startProduce(level?: HskLevel) {
    setFocusLevel(level)
    setSessionKey((k) => k + 1)
    setView('produce')
  }
  function startCloze(level?: HskLevel) {
    setFocusLevel(level)
    setSessionKey((k) => k + 1)
    setView('cloze')
  }

  function onNav(v: View) {
    if (v === 'learn') startLearn()
    else if (v === 'quiz') startQuiz()
    else setView(v)
  }

  const showTopBar = view === 'home' || view === 'browse' || view === 'community'

  return (
    <div className="app">
      {showTopBar && <TopBar />}

      {view === 'home' && (
        <Dashboard
          onLearn={startLearn}
          onQuiz={startQuiz}
          onProduce={startProduce}
          onCloze={startCloze}
          onFavorites={startFavorites}
          onProfile={() => setView('profile')}
        />
      )}
      {view === 'learn' && (
        <Flashcards
          key={sessionKey}
          level={focusLevel}
          onlyFavorites={favMode}
          onDone={() => setView('home')}
        />
      )}
      {view === 'quiz' && (
        <Quiz key={sessionKey} level={focusLevel} onDone={() => setView('home')} />
      )}
      {view === 'produce' && (
        <Produce key={sessionKey} level={focusLevel} onDone={() => setView('home')} />
      )}
      {view === 'cloze' && (
        <Cloze key={sessionKey} level={focusLevel} onDone={() => setView('home')} />
      )}
      {view === 'browse' && <Browse />}
      {view === 'community' && <Community />}
      {view === 'profile' && <Profile onBack={() => setView('home')} />}

      <Nav view={view} onChange={onNav} />
    </div>
  )
}

// 언어에 따라 중국어 트랙(기존) / 일본어 트랙 분기
function Root() {
  const { lang } = useLang()
  if (lang === 'jp') return <JpApp />
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Root />
    </LangProvider>
  )
}
