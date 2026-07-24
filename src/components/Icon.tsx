// 일관된 벡터 아이콘 세트(Lucide 스타일, stroke 2, currentColor).
// 이모지를 구조적 아이콘으로 쓰지 않기 위한 공통 컴포넌트.

export type IconName =
  | 'home'
  | 'cards'
  | 'quiz'
  | 'keyboard'
  | 'cloze'
  | 'star'
  | 'bookmark'
  | 'clock'
  | 'book'
  | 'chat'
  | 'flame'
  | 'settings'
  | 'grid'
  | 'speaker'
  | 'back'
  | 'check'
  | 'close'

// 각 아이콘의 <path>/도형 마크업(24x24 viewBox 기준)
const PATHS: Record<IconName, string> = {
  home: '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M9 21v-7h6v7"/>',
  cards:
    '<rect x="3" y="5" width="13" height="15" rx="2"/><path d="M8 5V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-1"/>',
  quiz: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  keyboard:
    '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  cloze:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  star: '<path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8-4.2-4.1 5.8-.8Z"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book: '<path d="M12 7v13"/><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H9a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4.5A1.5 1.5 0 0 1 21 5.5v11a1.5 1.5 0 0 1-1.5 1.5H15a3 3 0 0 0-3 3 3 3 0 0 0-3-3H4.5A1.5 1.5 0 0 1 3 16.5Z"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z"/>',
  flame:
    '<path d="M12 2c1 3-1.5 4.5-1.5 7A3.5 3.5 0 0 0 14 12c0-1 .5-2 .5-2 1 1.5 2.5 3 2.5 5.5A5 5 0 0 1 12 21a5 5 0 0 1-5-5c0-4 3-6 5-9Z"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4.4a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V4.4a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  speaker:
    '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a9 9 0 0 1 0 12"/>',
  back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
}

export default function Icon({
  name,
  size = 24,
  className,
  strokeWidth = 2,
}: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  )
}
