import type { JpProgress } from './jpStore'
import { isDue } from '../lib/srs'

// 학습 큐 구성: 복습 예정(due) 카드 우선 → 처음 보는 카드 → 나머지. 지정 크기로 자른다.
export function buildJpQueue<T extends { id: string }>(
  items: T[],
  progress: JpProgress,
  size = 20,
): T[] {
  const due: T[] = []
  const fresh: T[] = []
  const later: T[] = []
  for (const it of items) {
    const card = progress.cards[it.id]
    if (!card) fresh.push(it)
    else if (isDue(card)) due.push(it)
    else later.push(it)
  }
  shuffle(due)
  shuffle(fresh)
  const queue = [...due, ...fresh]
  if (queue.length < size) queue.push(...later.slice(0, size - queue.length))
  return queue.slice(0, size)
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
