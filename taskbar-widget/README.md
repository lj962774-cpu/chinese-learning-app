# 中 HSK 작업표시줄 단어장 (Chinese Taskbar)

Windows **작업표시줄(시스템 트레이)** 에 HSK 중국어 단어를 띄워 주는 자투리 학습 앱입니다.
트레이 아이콘에 한자가 그려지고, 마우스를 올리면 **단어·병음(성조)·뜻**이 툴팁으로 뜹니다.
설정한 간격마다 자동으로 다음 단어로 넘어가며 **알림 팝업**으로도 보여 줘서, 일하다 흘깃 볼 때마다 한 단어씩 눈에 익습니다.

> 단어 데이터: HSK 1~6급 **4,991개** (한자 · 병음 · 한국어 뜻 · 예문 포함)

## 화면 구성

- **트레이 아이콘** — 현재 단어의 한자가 그려집니다. 급수별로 배경색이 다릅니다.
  (HSK1 초록 · 2 파랑 · 3 보라 · 4 주황 · 5 빨강 · 6 회색)
- **툴팁** — 아이콘에 마우스를 올리면 `爱  [ài]` / `사랑하다` 형식으로 표시.
- **알림 팝업** — 새 단어로 넘어갈 때 제목(한자·급수)과 본문(병음·뜻·예문)을 알림으로.
- **우클릭 메뉴** — 다음/이전 단어, 급수 선택, 자동 넘김 간격, 각종 토글, 종료.

## 설치 & 실행 (소스에서)

Python 3.9 이상이 필요합니다.

```bash
# 이 폴더(taskbar-widget)는 그 자체로 독립 실행 가능합니다.
# 별도 레포로 분리하려면 taskbar-widget/ 폴더만 복사해 새 레포로 만드세요.
cd taskbar-widget
pip install -r requirements.txt

# 실행 (콘솔 로그 보면서 — 오류 확인에 좋음)
python run.pyw

# 콘솔 창 없이 조용히 실행
pythonw run.pyw
```

> `python -m chinese_taskbar` 로 실행하려면 먼저 `pip install .` (마침표 포함)
> 으로 패키지를 설치해야 합니다. 소스에서 바로 쓸 땐 `python run.pyw` 가 가장 간단합니다.

실행하면 작업표시줄 오른쪽 트레이 영역에 아이콘이 나타납니다.
(아이콘이 숨겨져 있으면 트레이의 `^` 를 눌러 펼치거나, 작업표시줄 설정에서 항상 표시로 바꾸세요.)

## 단독 실행 파일(.exe) 만들기

Python 설치 없이 배포하려면 PyInstaller 로 `.exe` 를 만들 수 있습니다.

```bash
pip install pyinstaller
python scripts/build_exe.py
# 결과물: dist/ChineseTaskbar.exe  (더블클릭 실행)
```

## Windows 시작 시 자동 실행

1. `Win + R` → `shell:startup` 입력 → 엔터 (시작프로그램 폴더가 열림)
2. `run.pyw`(또는 만든 `ChineseTaskbar.exe`)의 **바로 가기**를 그 폴더에 넣기

## 우클릭 메뉴 설명

| 메뉴 | 설명 |
| --- | --- |
| **단어 / 뜻 (맨 위)** | 현재 단어. 클릭하면 알림으로 다시 띄웁니다. |
| 다음 단어 ▶ / ◀ 이전 단어 | 수동으로 넘기기 |
| 알림으로 다시 보기 | 현재 단어를 알림 팝업으로 표시 |
| 급수(HSK) 선택 | 1~6급 중 학습할 급수 체크 (복수 선택) |
| 자동 넘김 간격 | 10초 / 30초 / 1분 / 3분 / 5분 / 10분 |
| 자동 넘김 | 자동으로 다음 단어로 넘어갈지 |
| 알림 팝업 | 넘어갈 때 알림을 띄울지 |
| 무작위 순서 | 랜덤/순차 순서 전환 |
| 설정 폴더 열기 | 설정 파일 위치 열기 |
| 종료 | 앱 종료 |

## 설정 저장 위치

설정은 아래 파일에 자동 저장됩니다.

- Windows: `%APPDATA%\ChineseTaskbar\config.json`
- macOS/Linux: `~/.config/chinese-taskbar/config.json`

## 프로젝트 구조

```
chinese-taskbar/
├── data/hsk-words.json          # HSK 1~6급 단어 데이터
├── src/chinese_taskbar/
│   ├── app.py                   # 트레이 앱 (메뉴·자동넘김·알림)
│   ├── words.py                 # 단어 로딩 / 레벨 필터 / 셔플
│   ├── config.py                # 설정 저장·불러오기
│   └── icon.py                  # 한자 → 트레이 아이콘 렌더링
├── scripts/build_exe.py         # PyInstaller 빌드 스크립트
├── run.pyw                      # 더블클릭/시작프로그램용 진입점
└── requirements.txt
```

## 참고

- macOS / Linux 에서도 트레이를 지원하는 데스크톱 환경이면 동작합니다
  (pystray 백엔드에 따라 알림·툴팁 동작이 다를 수 있음).
- 단어 데이터는 [chinese-learning-app](https://github.com/lj962774-cpu/chinese-learning-app) 의 HSK 데이터셋을 사용합니다.

## 라이선스

MIT
