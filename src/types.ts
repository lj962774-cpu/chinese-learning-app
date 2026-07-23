// 앱 전역에서 쓰이는 타입 정의

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface Word {
  id: string
  hanzi: string // 간체 한자
  pinyin: string // 성조 기호 포함 병음
  meaning: string // 대표 뜻 (한국어 우선, 없으면 영어)
  en?: string // 영어 뜻 (원 데이터셋)
  pos?: string // 품사 (명사, 동사 등)
  level: HskLevel
  example?: {
    hanzi: string
    pinyin: string
    meaning: string
  }
}

// 간격 반복(SRS) 학습 카드 상태 — Leitner 박스 방식
export interface CardState {
  wordId: string
  box: number // 0~5 (숫자가 클수록 잘 외운 단어)
  due: number // 다음 복습 예정 시각 (epoch ms)
  correct: number
  wrong: number
  lastReviewed: number | null
}

export interface Progress {
  cards: Record<string, CardState>
  xp: number
  streak: number
  lastStudyDate: string | null // YYYY-MM-DD
  dailyGoal: number // 하루 목표 카드 수
  todayCount: number
  todayDate: string | null
  favorites: string[] // 즐겨찾기한 단어 id
  // 연상 암기(키워드법 + 이중부호화): 단어별 사용자 메모와 이모지
  mnemonics: Record<string, Mnemonic>
}

export interface Mnemonic {
  text: string // 연상 메모(모국어 키워드 등)
  emoji: string // 시각 단서(이중부호화)
}

export interface Settings {
  showPinyin: boolean
  showMeaningFirst: boolean // 뜻 → 한자 방향 학습
  autoSpeak: boolean
  nickname: string
}

// 커뮤니티(소통) 데이터
export interface Post {
  id: string
  author: string
  title: string
  body: string
  tag: PostTag
  createdAt: number
  likes: number
  liked: boolean
  comments: Comment[]
}

export type PostTag = '질문' | '공유' | '자유' | '스터디모집'

export interface Comment {
  id: string
  author: string
  body: string
  createdAt: number
}
