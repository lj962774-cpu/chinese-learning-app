# 汉语通 (Hànyǔ Tōng) · 중국어 학습 웹앱

HSK 기준 **필수 단어 학습** + **학습 커뮤니티(소통)** + 시중 학습 앱의 인기 기능을 담은
모바일 우선(mobile-first) 중국어 학습 웹앱입니다. 백엔드/설치 없이 브라우저만으로 동작합니다.

> 첫 번째 언어로 **중국어**를 지원합니다. 데이터/컴포넌트 구조는 다른 언어로 확장할 수 있도록 분리되어 있습니다.

## ✨ 주요 기능

### 단어 학습 (HSK 1~6급 · 약 5,000단어 전체)
- **HSK(구 2.0) 1~6급 전체 단어** 수록 (1급 150 · 2급 147 · 3급 298 · 4급 598 · 5급 1298 · 6급 2500)
- **플래시카드 + 간격 반복 학습(SRS)** — Leitner 박스 방식으로 잊을 때쯤 다시 복습
- **4지선다 퀴즈** — 레벨별/전체 실력 점검
- **원어민 발음 듣기** — 브라우저 내장 Web Speech API(zh-CN), 별도 키 불필요
- **예문 학습** — 병음·뜻이 포함된 기초 예문
- **단어장 브라우저** — 레벨별 검색, 즐겨찾기, 단어별 숙련도 표시

### 인기 학습 앱 기능 (Duolingo·Anki 등에서 수요가 높은 요소)
- 🔥 **연속 학습(streak)** 과 하루 목표
- ⭐ **XP / 게이미피케이션** — 정답 시 XP 획득, 마스터 카운트
- ⭐ **즐겨찾기 복습** — 어려운 단어만 모아 복습
- 📊 **학습 통계** 대시보드
- 🌙 **다크 모드** 자동 대응

### 소통 기능 (커뮤니티)
- 질문 / 공유 / 자유 / 스터디모집 태그 게시판
- 글 작성, 좋아요, 댓글
- 현재는 로컬 저장(localStorage)으로 동작 — `src/lib/community.ts` 계층만 교체하면
  Supabase/Firebase 등 실시간 백엔드로 확장 가능

## 📖 데이터 출처
HSK 단어의 한자·병음·영어 뜻은 오픈 데이터셋
[complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) (MIT,
© Yanis Zafirópulos)을 기반으로 합니다 — `THIRD_PARTY_LICENSES.txt` 참고.
한국어 뜻·예문은 일부 단어에 대해 앱에서 큐레이션했으며, 나머지는 영어 뜻을 표시합니다
(점진적으로 한국어화 예정).

## 🛠 기술 스택
- Vite + React 19 + TypeScript
- 상태 영속화: localStorage (`src/lib/storage.ts`)
- 배포: GitHub Pages (GitHub Actions 자동 배포)

## 🚀 개발
```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```

## 📦 배포
`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml` 이 자동으로 GitHub Pages에 배포합니다.
저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 설정하세요.

## 📁 구조
```
src/
  data/hsk.ts          # HSK 레벨별 단어 데이터셋
  lib/
    srs.ts             # 간격 반복(Leitner) 로직
    storage.ts         # 진행도/설정 저장
    speech.ts          # 발음(TTS)
    community.ts       # 커뮤니티 데이터 계층
    session.ts         # 학습 큐 구성
    levels.ts          # 레벨 메타
  context/AppContext.tsx  # 전역 상태(진행도·설정)
  components/          # 화면 컴포넌트
```

## 🗺 향후 확장 아이디어
- 백엔드 연동(계정, 실시간 커뮤니티, 랭킹)
- HSK 3.0 전체 단어 및 한자 획순 애니메이션
- 듣기 받아쓰기 / 문장 만들기 연습
- 다른 언어(일본어·영어 등) 코스 추가
