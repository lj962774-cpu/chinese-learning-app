// Web Speech API를 이용한 중국어(zh-CN) 발음 재생. 별도 서버/키가 필요 없다.

let cachedVoice: SpeechSynthesisVoice | null = null

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  const zh =
    voices.find((v) => v.lang.toLowerCase().startsWith('zh-cn')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('zh'))
  cachedVoice = zh ?? null
  return cachedVoice
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

export function speak(text: string): void {
  if (!speechSupported()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-CN'
  const v = pickChineseVoice()
  if (v) u.voice = v
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}

// 일부 브라우저는 voices가 비동기로 로드되므로 준비를 유도한다.
export function warmUpVoices(): void {
  if (!speechSupported()) return
  window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    pickChineseVoice()
  }
}
