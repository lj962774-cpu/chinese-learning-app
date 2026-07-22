import type { CardState } from '../types'

// Leitner 박스 기반 간격 반복(SRS)
// box 숫자가 클수록 잘 외운 단어 → 복습 간격이 길어진다.
const DAY = 24 * 60 * 60 * 1000
const INTERVALS_DAYS = [0, 1, 2, 4, 8, 16] // box 0~5의 복습 간격(일)
export const MAX_BOX = INTERVALS_DAYS.length - 1

export function newCard(wordId: string): CardState {
  return {
    wordId,
    box: 0,
    due: Date.now(),
    correct: 0,
    wrong: 0,
    lastReviewed: null,
  }
}

// 복습 결과 반영. correct=true면 박스 상승, false면 박스 0으로 초기화.
export function review(card: CardState, correct: boolean): CardState {
  const now = Date.now()
  const box = correct ? Math.min(card.box + 1, MAX_BOX) : 0
  const intervalDays = INTERVALS_DAYS[box]
  // 오답은 10분 뒤 다시, 정답은 박스 간격만큼 뒤에 복습
  const due = correct ? now + intervalDays * DAY : now + 10 * 60 * 1000
  return {
    ...card,
    box,
    due,
    correct: card.correct + (correct ? 1 : 0),
    wrong: card.wrong + (correct ? 0 : 1),
    lastReviewed: now,
  }
}

export function isDue(card: CardState): boolean {
  return card.due <= Date.now()
}

// 학습 숙련도(0~1): 박스 위치 기준
export function mastery(card: CardState): number {
  return card.box / MAX_BOX
}
