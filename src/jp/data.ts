import type { Kana, KanaGroup, KanaScript, JpWord } from './types'
import kanaData from './kana.json'
import wordsData from './jp-words.json'

// 가나(히라가나·가타카나) + JLPT N5 기초 단어 데이터.
// 로마자·예시는 앱에서 큐레이션. 데이터는 src/jp/*.json 에 저장된다.

export const KANA: Kana[] = kanaData as unknown as Kana[]
export const JP_WORDS: JpWord[] = wordsData as unknown as JpWord[]

export const KANA_GROUPS: { key: KanaGroup; label: string }[] = [
  { key: 'basic', label: '청음 (기본 46자)' },
  { key: 'dakuten', label: '탁음 (゛)' },
  { key: 'handakuten', label: '반탁음 (゜)' },
  { key: 'yoon', label: '요음 (꺾임소리)' },
]

export function kanaBy(script: KanaScript, group?: KanaGroup): Kana[] {
  return KANA.filter((k) => k.script === script && (!group || k.group === group))
}

export const KANA_MAP: Record<string, Kana> = Object.fromEntries(
  KANA.map((k) => [k.id, k]),
)

export const JP_WORD_MAP: Record<string, JpWord> = Object.fromEntries(
  JP_WORDS.map((w) => [w.id, w]),
)

// 단어의 대표 표기(한자 우선, 없으면 가나)
export function jpDisplay(w: JpWord): string {
  return w.kanji ?? w.kana
}
