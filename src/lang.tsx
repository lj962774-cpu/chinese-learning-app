import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

// 학습 언어 선택(중국어 / 일본어). 최상단에서 두 트랙을 분기한다.

export type Lang = 'zh' | 'jp'

const LANG_KEY = 'cla:lang:v1'

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangState | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(LANG_KEY) as Lang) || 'zh'
    } catch {
      return 'zh'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // 무시
    }
  }, [lang])

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState }}>{children}</Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}

// 홈 화면 상단에 놓는 언어 선택 토글
export function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-switch" role="tablist" aria-label="학습 언어">
      <button
        role="tab"
        aria-selected={lang === 'zh'}
        className={lang === 'zh' ? 'on' : ''}
        onClick={() => setLang('zh')}
      >
        🇨🇳 중국어
      </button>
      <button
        role="tab"
        aria-selected={lang === 'jp'}
        className={lang === 'jp' ? 'on' : ''}
        onClick={() => setLang('jp')}
      >
        🇯🇵 일본어
      </button>
    </div>
  )
}
