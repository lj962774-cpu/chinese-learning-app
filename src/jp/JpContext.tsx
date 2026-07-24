import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CardState } from '../types'
import { newCard, review } from '../lib/srs'
import {
  defaultJpProgress,
  loadJpProgress,
  recordStudyJp,
  rollDailyJp,
  saveJpProgress,
  type JpProgress,
} from './jpStore'

interface JpState {
  progress: JpProgress
  reviewCard: (id: string, correct: boolean) => void
  getCard: (id: string) => CardState | undefined
  resetJp: () => void
}

const Ctx = createContext<JpState | null>(null)

export function JpProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<JpProgress>(() =>
    rollDailyJp(loadJpProgress()),
  )

  useEffect(() => {
    saveJpProgress(progress)
  }, [progress])

  const value = useMemo<JpState>(() => {
    return {
      progress,
      getCard: (id) => progress.cards[id],
      reviewCard: (id, correct) => {
        setProgress((prev) => {
          const existing = prev.cards[id] ?? newCard(id)
          const updated = review(existing, correct)
          const gained = correct ? 10 + updated.box * 2 : 2
          const withStudy = recordStudyJp(prev, gained)
          return {
            ...withStudy,
            cards: { ...withStudy.cards, [id]: updated },
          }
        })
      },
      resetJp: () => setProgress({ ...defaultJpProgress }),
    }
  }, [progress])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useJp(): JpState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useJp must be used within JpProvider')
  return ctx
}
