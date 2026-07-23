import type { Progress, Settings } from '../types'

// localStorage 기반 영속 저장. 향후 서버/계정 연동 시 이 계층만 교체하면 된다.

const PROGRESS_KEY = 'cla:progress:v1'
const SETTINGS_KEY = 'cla:settings:v1'

export function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export const defaultProgress: Progress = {
  cards: {},
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  dailyGoal: 20,
  todayCount: 0,
  todayDate: null,
  favorites: [],
  mnemonics: {},
}

export const defaultSettings: Settings = {
  showPinyin: true,
  showMeaningFirst: false,
  autoSpeak: true,
  nickname: '',
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return { ...defaultProgress }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      ...defaultProgress,
      ...parsed,
      cards: parsed.cards ?? {},
      mnemonics: parsed.mnemonics ?? {},
    }
  } catch {
    return { ...defaultProgress }
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  } catch {
    // 저장 공간 초과 등은 조용히 무시
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...defaultSettings }
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // 무시
  }
}

// 하루 경계·연속 학습(streak) 갱신 로직
export function rollDaily(p: Progress): Progress {
  const today = todayStr()
  if (p.todayDate === today) return p
  return { ...p, todayDate: today, todayCount: 0 }
}

// 학습 1회 반영: XP·streak·오늘 학습 수 갱신
export function recordStudy(p: Progress, gainedXp: number): Progress {
  const today = todayStr()
  const yesterday = todayStr(new Date(Date.now() - 24 * 60 * 60 * 1000))
  let streak = p.streak
  if (p.lastStudyDate !== today) {
    streak = p.lastStudyDate === yesterday ? p.streak + 1 : 1
  }
  const base = rollDaily(p)
  return {
    ...base,
    xp: base.xp + gainedXp,
    streak,
    lastStudyDate: today,
    todayCount: base.todayCount + 1,
  }
}
