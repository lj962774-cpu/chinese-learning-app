import type { HskLevel, Progress, Word } from '../types'
import { WORDS } from '../data/hsk'
import { isDue } from './srs'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 학습 세션 큐 구성: 복습 예정(due) 카드 우선, 그다음 처음 보는 단어.
export function buildQueue(
  progress: Progress,
  opts: {
    level?: HskLevel
    size?: number
    onlyFavorites?: boolean
    onlyExamples?: boolean
  } = {},
): Word[] {
  const size = opts.size ?? 20
  let pool = WORDS
  if (opts.level) pool = pool.filter((w) => w.level === opts.level)
  if (opts.onlyFavorites) pool = pool.filter((w) => progress.favorites.includes(w.id))
  if (opts.onlyExamples) pool = pool.filter((w) => w.example)

  const due: Word[] = []
  const fresh: Word[] = []
  for (const w of pool) {
    const card = progress.cards[w.id]
    if (!card) fresh.push(w)
    else if (isDue(card)) due.push(w)
  }
  const queue = [...shuffle(due), ...shuffle(fresh)]
  return queue.slice(0, size)
}
