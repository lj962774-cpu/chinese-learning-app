import { useState } from 'react'
import type { KanaScript } from './types'
import { KANA_GROUPS, kanaBy } from './data'
import { speakJa, speechSupported } from '../lib/speech'
import { useJp } from './JpContext'

// 가나표: 스크립트(히라가나/가타카나)별로 그룹을 나눠 보여준다. 탭하면 발음 재생 + 예시.
export default function KanaChart({ onBack }: { onBack: () => void }) {
  const [script, setScript] = useState<KanaScript>('hira')
  const [sel, setSel] = useState<string | null>(null)
  const { progress } = useJp()

  return (
    <div className="view">
      <div className="flash-top">
        <button className="small" onClick={onBack} style={{ fontWeight: 700 }}>
          ← 나가기
        </button>
        <span>가나표</span>
      </div>

      <div className="seg">
        <button className={script === 'hira' ? 'on' : ''} onClick={() => setScript('hira')}>
          히라가나 あ
        </button>
        <button className={script === 'kata' ? 'on' : ''} onClick={() => setScript('kata')}>
          가타카나 ア
        </button>
      </div>

      {KANA_GROUPS.map((g) => {
        const rows = kanaBy(script, g.key)
        if (rows.length === 0) return null
        return (
          <div key={g.key} style={{ marginTop: 14 }}>
            <div className="section-title" style={{ marginTop: 4 }}>
              {g.label}
            </div>
            <div className="kana-grid">
              {rows.map((k) => {
                const box = progress.cards[k.id]?.box ?? 0
                return (
                  <button
                    key={k.id}
                    className={`kana-cell ${sel === k.id ? 'sel' : ''}`}
                    onClick={() => {
                      setSel(k.id)
                      speakJa(k.kana)
                    }}
                  >
                    <span className="kc-char">{k.kana}</span>
                    <span className="kc-romaji">{k.romaji}</span>
                    {box > 0 && <span className="kc-dot" aria-label="학습함" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {sel && (() => {
        const k = kanaBy(script).find((x) => x.id === sel)
        if (!k) return null
        return (
          <div className="card kana-detail">
            <div className="kd-char">{k.kana}</div>
            <div className="kd-romaji">{k.romaji}</div>
            {k.ex && (
              <div className="example" style={{ marginTop: 8 }}>
                <div style={{ fontSize: 20 }}>{k.ex.word}</div>
                <div className="ex-py">{k.ex.reading}</div>
                <div className="ex-mn">{k.ex.meaning}</div>
              </div>
            )}
            {speechSupported() && (
              <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => speakJa(k.ex?.word ?? k.kana)}>
                🔊 발음 듣기
              </button>
            )}
          </div>
        )
      })()}
    </div>
  )
}
