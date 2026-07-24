import { useState } from 'react'
import type { KanaScript } from './types'
import { JpProvider } from './JpContext'
import JpDashboard from './JpDashboard'
import KanaChart from './KanaChart'
import KanaLearn from './KanaLearn'
import KanaQuiz from './KanaQuiz'
import JpFlashcards from './JpFlashcards'
import JpQuiz from './JpQuiz'

type JpView = 'home' | 'kanaChart' | 'kanaLearn' | 'kanaQuiz' | 'vocab' | 'vocabQuiz'

function JpShell() {
  const [view, setView] = useState<JpView>('home')
  const [script, setScript] = useState<KanaScript>('hira')
  const [sessionKey, setSessionKey] = useState(0)

  const home = () => setView('home')
  const start = (v: JpView) => {
    setSessionKey((k) => k + 1)
    setView(v)
  }

  return (
    <div className="app">
      {view === 'home' && (
        <JpDashboard
          onKanaChart={() => setView('kanaChart')}
          onKanaLearn={(s) => {
            setScript(s)
            start('kanaLearn')
          }}
          onKanaQuiz={() => start('kanaQuiz')}
          onVocab={() => start('vocab')}
          onVocabQuiz={() => start('vocabQuiz')}
        />
      )}
      {view === 'kanaChart' && <KanaChart onBack={home} />}
      {view === 'kanaLearn' && <KanaLearn key={sessionKey} script={script} onDone={home} />}
      {view === 'kanaQuiz' && <KanaQuiz key={sessionKey} onDone={home} />}
      {view === 'vocab' && <JpFlashcards key={sessionKey} onDone={home} />}
      {view === 'vocabQuiz' && <JpQuiz key={sessionKey} onDone={home} />}
    </div>
  )
}

export default function JpApp() {
  return (
    <JpProvider>
      <JpShell />
    </JpProvider>
  )
}
