import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CardState, Progress, Settings } from '../types'
import {
  defaultProgress,
  defaultSettings,
  loadProgress,
  loadSettings,
  recordStudy,
  rollDaily,
  saveProgress,
  saveSettings,
} from '../lib/storage'
import { newCard, review } from '../lib/srs'
import { WORDS } from '../data/hsk'

interface AppState {
  progress: Progress
  settings: Settings
  // 단어 학습 결과 반영 (SRS + XP + streak)
  reviewWord: (wordId: string, correct: boolean) => void
  toggleFavorite: (wordId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  setDailyGoal: (n: number) => void
  resetProgress: () => void
  getCard: (wordId: string) => CardState | undefined
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => rollDaily(loadProgress()))
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const value = useMemo<AppState>(() => {
    return {
      progress,
      settings,
      getCard: (wordId) => progress.cards[wordId],
      reviewWord: (wordId, correct) => {
        setProgress((prev) => {
          const existing = prev.cards[wordId] ?? newCard(wordId)
          const updated = review(existing, correct)
          const gained = correct ? 10 + updated.box * 2 : 2
          const withStudy = recordStudy(prev, gained)
          return {
            ...withStudy,
            cards: { ...withStudy.cards, [wordId]: updated },
          }
        })
      },
      toggleFavorite: (wordId) => {
        setProgress((prev) => {
          const has = prev.favorites.includes(wordId)
          return {
            ...prev,
            favorites: has
              ? prev.favorites.filter((f) => f !== wordId)
              : [...prev.favorites, wordId],
          }
        })
      },
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
      setDailyGoal: (n) =>
        setProgress((prev) => ({ ...prev, dailyGoal: Math.max(5, n) })),
      resetProgress: () => setProgress({ ...defaultProgress }),
    }
  }, [progress, settings])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// 파생 통계 계산 헬퍼
export function useStats() {
  const { progress } = useApp()
  const cards = Object.values(progress.cards)
  const learned = cards.filter((c) => c.box >= 1).length
  const mastered = cards.filter((c) => c.box >= 5).length
  const due = cards.filter((c) => c.due <= Date.now()).length
  const total = WORDS.length
  return { learned, mastered, due, total, seen: cards.length }
}

export { defaultSettings }
