import type { Word, HskLevel } from '../types'
import wordsData from './hsk-words.json'

// HSK(구 2.0) 1~6급 전체 단어 데이터.
// 한자·병음·영어 뜻: 오픈 데이터셋 "complete-hsk-vocabulary" (MIT, © Yanis Zafirópulos)
//   https://github.com/drkameleon/complete-hsk-vocabulary
// 한국어 뜻/예문: 앱에서 큐레이션한 항목에 한해 우선 적용(meaning). 나머지는 영어 뜻 사용.
// 데이터는 src/data/hsk-words.json 에 저장되며 계속 한국어화/확장할 수 있다.

export const WORDS: Word[] = wordsData as unknown as Word[]

export const LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6]

const BY_LEVEL: Record<number, Word[]> = {}
for (const w of WORDS) {
  ;(BY_LEVEL[w.level] ??= []).push(w)
}

export function wordsByLevel(level: HskLevel): Word[] {
  return BY_LEVEL[level] ?? []
}

export const WORD_MAP: Record<string, Word> = Object.fromEntries(
  WORDS.map((w) => [w.id, w]),
)

export function getWord(id: string): Word | undefined {
  return WORD_MAP[id]
}
