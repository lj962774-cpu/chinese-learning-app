import { useState } from 'react'
import type { Post, PostTag } from '../types'
import { useApp } from '../context/AppContext'
import {
  addComment,
  createPost,
  loadPosts,
  timeAgo,
  toggleLike,
} from '../lib/community'

const TAGS: PostTag[] = ['질문', '공유', '자유', '스터디모집']

export default function Community() {
  const { settings } = useApp()
  const me = settings.nickname.trim() || '나'
  const [posts, setPosts] = useState<Post[]>(() => loadPosts())
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState<PostTag>('질문')
  const [openId, setOpenId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  function submitPost() {
    if (!title.trim() || !body.trim()) return
    setPosts(createPost(posts, { author: me, title, body, tag }))
    setTitle('')
    setBody('')
    setTag('질문')
    setComposing(false)
  }

  function submitComment(postId: string) {
    if (!commentText.trim()) return
    setPosts(addComment(posts, postId, me, commentText))
    setCommentText('')
  }

  return (
    <div className="view">
      <div className="topbar" style={{ padding: 0, marginBottom: 12 }}>
        <h1>커뮤니티</h1>
        <button
          className="btn primary"
          style={{ padding: '8px 14px', fontSize: 14 }}
          onClick={() => setComposing((c) => !c)}
        >
          {composing ? '닫기' : '✏️ 글쓰기'}
        </button>
      </div>

      {composing && (
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div className="pill-select">
            {TAGS.map((t) => (
              <button
                key={t}
                className={tag === t ? 'sel' : ''}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <label>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
          <label>내용</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="학습하며 궁금한 점, 팁, 후기를 나눠보세요"
          />
          <button
            className="btn primary full"
            style={{ marginTop: 12 }}
            onClick={submitPost}
          >
            게시하기
          </button>
          <p className="small" style={{ marginTop: 8, textAlign: 'center' }}>
            작성자: {me} · 글은 이 기기에 저장돼요
          </p>
        </div>
      )}

      <div className="card">
        {posts.map((p) => {
          const open = openId === p.id
          return (
            <div key={p.id} className="post">
              <div className="head">
                <span className={`tag ${p.tag}`}>{p.tag}</span>
                <b style={{ color: 'var(--text)' }}>{p.author}</b>
                <span>· {timeAgo(p.createdAt)}</span>
              </div>
              <h3>{p.title}</h3>
              <div className="body">{p.body}</div>
              <div className="foot">
                <button
                  className={p.liked ? 'liked' : ''}
                  onClick={() => setPosts(toggleLike(posts, p.id))}
                >
                  {p.liked ? '❤️' : '🤍'} {p.likes}
                </button>
                <button onClick={() => setOpenId(open ? null : p.id)}>
                  💬 {p.comments.length}
                </button>
              </div>

              {open && (
                <div style={{ marginTop: 10 }}>
                  {p.comments.map((c) => (
                    <div key={c.id} className="comment">
                      <div className="who">
                        {c.author} <span className="small">· {timeAgo(c.createdAt)}</span>
                      </div>
                      <div>{c.body}</div>
                    </div>
                  ))}
                  <div className="field-row" style={{ marginTop: 10 }}>
                    <input
                      placeholder="댓글 달기..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitComment(p.id)
                      }}
                    />
                    <button
                      className="btn primary"
                      style={{ padding: '0 18px', flexShrink: 0 }}
                      onClick={() => submitComment(p.id)}
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
