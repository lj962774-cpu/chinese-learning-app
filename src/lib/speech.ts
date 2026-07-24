// Web Speech API를 이용한 발음 재생(중국어 zh-CN / 일본어 ja-JP). 별도 서버/키가 필요 없다.

const cachedVoice: Record<string, SpeechSynthesisVoice | null> = {}

// 언어별 음성 선택. prefixes 순서대로 우선 매칭한다.
function pickVoice(key: string, prefixes: string[]): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (cachedVoice[key]) return cachedVoice[key]
  const voices = window.speechSynthesis.getVoices()
  let found: SpeechSynthesisVoice | undefined
  for (const p of prefixes) {
    found = voices.find((v) => v.lang.toLowerCase().startsWith(p))
    if (found) break
  }
  cachedVoice[key] = found ?? null
  return cachedVoice[key]
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

// 공통 재생 헬퍼
function speakWith(text: string, lang: string, key: string, prefixes: string[]): void {
  if (!speechSupported()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  const v = pickVoice(key, prefixes)
  if (v) u.voice = v
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

// 중국어(zh-CN) 발음
export function speak(text: string): void {
  speakWith(text, 'zh-CN', 'zh', ['zh-cn', 'zh'])
}

// 일본어(ja-JP) 발음
export function speakJa(text: string): void {
  speakWith(text, 'ja-JP', 'ja', ['ja-jp', 'ja'])
}

// 일부 브라우저는 voices가 비동기로 로드되므로 준비를 유도한다.
export function warmUpVoices(): void {
  if (!speechSupported()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice.zh = null
    cachedVoice.ja = null
    pickVoice('zh', ['zh-cn', 'zh'])
    pickVoice('ja', ['ja-jp', 'ja'])
  }
}
