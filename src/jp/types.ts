// 일본어 학습 트랙 타입 정의

export type KanaScript = 'hira' | 'kata'
export type KanaGroup = 'basic' | 'dakuten' | 'handakuten' | 'yoon'

export interface Kana {
  id: string
  kana: string // 히라가나 또는 가타카나 글자
  romaji: string // 로마자 발음
  script: KanaScript
  group: KanaGroup
  ex?: {
    word: string // 예시 단어(가나 표기)
    reading: string // 로마자 읽기
    meaning: string // 한국어 뜻
  }
}

export type JlptLevel = 'N5'

export interface JpWord {
  id: string
  kanji?: string // 한자 표기(없으면 kana 자체가 표기)
  kana: string // 가나 표기(읽기)
  romaji: string // 로마자
  meaning: string // 한국어 뜻
  level: JlptLevel
  example?: {
    jp: string // 예문(한자·가나)
    reading: string // 예문 로마자 읽기
    meaning: string // 예문 한국어 뜻
  }
}
