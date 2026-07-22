import type { Post, Comment, PostTag } from '../types'

// 커뮤니티(소통) 데이터 계층.
// 현재는 localStorage 기반 로컬 저장. 인터페이스를 유지한 채 향후
// Supabase/Firebase 등 백엔드로 교체할 수 있도록 함수 경계를 분리했다.

const KEY = 'cla:community:v1'

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const SEED: Post[] = [
  {
    id: 'seed-1',
    author: '샤오밍',
    title: 'HSK 4급 한 달 만에 붙은 후기 (단어 암기 팁)',
    body: '매일 아침 플래시카드 30개 + 저녁에 틀린 것만 복습했어요. 간격 반복 기능이 진짜 효자입니다. 예문까지 소리 내서 읽으니 듣기도 같이 늘더라고요!',
    tag: '공유',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    likes: 12,
    liked: false,
    comments: [
      {
        id: 'sc-1',
        author: '왕리',
        body: '오 저도 오늘부터 따라해볼게요. 하루 목표 몇 개로 잡으셨어요?',
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],
  },
  {
    id: 'seed-2',
    author: '이수진',
    title: '“了(le)” 용법이 너무 헷갈려요 ㅠㅠ',
    body: '완료의 了와 어기조사 了 구분이 아직도 안 됩니다. 쉽게 이해한 분 계신가요?',
    tag: '질문',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    likes: 4,
    liked: false,
    comments: [],
  },
  {
    id: 'seed-3',
    author: 'Chen',
    title: '[스터디 모집] 평일 저녁 HSK 5급 회화 스터디',
    body: '주 3회 화상으로 30분씩 회화 연습해요. 초급 벗어난 분 환영합니다. 관심 있으면 댓글 주세요!',
    tag: '스터디모집',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    likes: 7,
    liked: false,
    comments: [],
  },
]

export function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED))
      return [...SEED]
    }
    return JSON.parse(raw) as Post[]
  } catch {
    return [...SEED]
  }
}

function persist(posts: Post[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(posts))
  } catch {
    // 무시
  }
}

export function createPost(
  posts: Post[],
  input: { author: string; title: string; body: string; tag: PostTag },
): Post[] {
  const post: Post = {
    id: uid(),
    author: input.author.trim() || '익명',
    title: input.title.trim(),
    body: input.body.trim(),
    tag: input.tag,
    createdAt: Date.now(),
    likes: 0,
    liked: false,
    comments: [],
  }
  const next = [post, ...posts]
  persist(next)
  return next
}

export function toggleLike(posts: Post[], postId: string): Post[] {
  const next = posts.map((p) =>
    p.id === postId
      ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
      : p,
  )
  persist(next)
  return next
}

export function addComment(
  posts: Post[],
  postId: string,
  author: string,
  body: string,
): Post[] {
  const comment: Comment = {
    id: uid(),
    author: author.trim() || '익명',
    body: body.trim(),
    createdAt: Date.now(),
  }
  const next = posts.map((p) =>
    p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
  )
  persist(next)
  return next
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  return `${day}일 전`
}
