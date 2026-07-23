// 병음 정규화 — 생산형(타이핑) 채점용.
// 성조 기호를 제거하고 공백·대소문자를 무시해 관대하게 비교한다.
// 예) "Nǐ hǎo" == "nihao" == "ni hao"

const TONE_MAP: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v', ü: 'v',
}

export function normalizePinyin(s: string): string {
  return Array.from(s.toLowerCase())
    .map((ch) => TONE_MAP[ch] ?? ch)
    .join('')
    .replace(/['’ū·\-\s]/g, '') // 공백·아포스트로피·붙임표 제거
    .replace(/[^a-z0-9]/g, '') // 숫자 병음(ni3 등)도 허용, 그 외 문자 제거
}

// 사용자가 성조 숫자(ni3hao3)로 입력한 경우도 관대하게 처리
function stripToneNumbers(s: string): string {
  return s.replace(/[1-5]/g, '')
}

export function pinyinMatches(input: string, answer: string): boolean {
  const a = normalizePinyin(input)
  const b = normalizePinyin(answer)
  if (!a) return false
  return a === b || stripToneNumbers(a) === stripToneNumbers(b)
}
