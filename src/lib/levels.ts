import type { HskLevel } from '../types'

// 레벨별 배지 색상
const COLORS: Record<HskLevel, string> = {
  1: '#16a34a',
  2: '#0891b2',
  3: '#2563eb',
  4: '#7c3aed',
  5: '#db2777',
  6: '#dc2626',
}

export function levelColor(level: HskLevel): string {
  return COLORS[level]
}

export function levelLabel(level: HskLevel): string {
  return `HSK ${level}급`
}
