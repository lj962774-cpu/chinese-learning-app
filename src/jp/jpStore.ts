import type { CardState } from '../types'

// 일본어 트랙 진도 저장(중국어와 분리된 localStorage 키).
// 카드 id 규칙: 가나 = kana.json 의 id, 단어 = jp-words.json 의 id.

const JP_KEY = 'cla:jp:progress:v1'

export interface JpProgress {
  cards: Record<string, CardState>
  xp: number
  streak: number
  lastStudyDate: string | null
  todayCount: number
  todayDate: string | null
}

export const defaultJpProgress: JpProgress = {
  cards: {},
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  todayCount: 0,
  todayDate: null,
}

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function loadJpProgress(): JpProgress {
  try {
    const raw = localStorage.getItem(JP_KEY)
    if (!raw) return { ...defaultJpProgress }
    const parsed = JSON.parse(raw) as Partial<JpProgress>
    return { ...defaultJpProgress, ...parsed, cards: parsed.cards ?? {} }
  } catch {
    return { ...defaultJpProgress }
  }
}

export function saveJpProgress(p: JpProgress): void {
  try {
    localStorage.setItem(JP_KEY, JSON.stringify(p))
  } catch {
    // 무시
  }
}

export function rollDailyJp(p: JpProgress): JpProgress {
  const today = todayStr()
  if (p.todayDate === today) return p
  return { ...p, todayDate: today, todayCount: 0 }
}

export function recordStudyJp(p: JpProgress, gainedXp: number): JpProgress {
  const today = todayStr()
  const yesterday = todayStr(new Date(Date.now() - 24 * 60 * 60 * 1000))
  let streak = p.streak
  if (p.lastStudyDate !== today) {
    streak = p.lastStudyDate === yesterday ? p.streak + 1 : 1
  }
  const base = rollDailyJp(p)
  return {
    ...base,
    xp: base.xp + gainedXp,
    streak,
    lastStudyDate: today,
    todayCount: base.todayCount + 1,
  }
}
