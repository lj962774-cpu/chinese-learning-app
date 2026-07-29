# 中 HSK 작업표시줄 단어장 (Chinese Taskbar)

화면 하단 **작업표시줄 위에 항상 떠 있는 얇은 가로바**에 HSK 중국어 단어를 상시 표시해 주는 자투리 학습 앱입니다.
일하는 화면 맨 아래에 `爱 [ài] 사랑하다  HSK1` 처럼 **단어 · 병음(성조) · 뜻 · 급수**가 계속 보여서, 흘깃 볼 때마다 한 단어씩 눈에 익습니다. 설정한 간격마다 자동으로 다음 단어로 넘어갑니다.

> 단어 데이터: HSK 1~6급 **4,991개** (한자 · 병음 · 한국어 뜻 · 예문 포함)

## 두 가지 실행 방식

| 방식 | 진입점 | 특징 | 추가 설치 |
| --- | --- | --- | --- |
| **① 하단 가로바 (기본/추천)** | `run_bar.pyw` | 작업표시줄 위에 글자로 **상시 표시**. 클릭하면 다음 단어. | **불필요** (tkinter 내장) |
| ② 트레이 아이콘 + 알림 | `run.pyw` | 트레이 아이콘 + 주기적 알림 팝업 | `pip install -r requirements.txt` |

> 💡 **바로 시작하려면 ① 하단 가로바**를 쓰세요. 파이썬 기본 내장 모듈(tkinter)만 쓰기 때문에
> `pip install` 없이 바로 실행됩니다.

## 하단 가로바 실행 (추천)

Python 3.9 이상만 있으면 됩니다. (Windows용 Python 은 tkinter 를 기본 포함)

```bash
cd taskbar-widget

# 실행 (콘솔 로그 보면서 — 오류 확인에 좋음)
python run_bar.pyw

# 콘솔 창 없이 조용히 실행
pythonw run_bar.pyw
```

실행하면 화면 오른쪽 아래, 작업표시줄 바로 위에 얇은 바가 나타납니다.

### 바 조작법

| 동작 | 결과 |
| --- | --- |
| **왼쪽 클릭** | 다음 단어로 넘김 |
| **왼쪽 드래그** | 바 위치 이동 (위치 자동 저장) |
| **오른쪽 클릭** | 메뉴: 다음 단어 · 급수(HSK) 선택 · 자동 넘김 간격 · 자동 넘김/무작위 토글 · 글자 크게/작게 · 위치 초기화 · 종료 |

## 트레이 아이콘 + 알림 방식 (선택)

트레이 아이콘에 한자를 그리고, 넘어갈 때마다 알림 팝업을 띄우는 방식입니다.

```bash
cd taskbar-widget
pip install -r requirements.txt   # pystray, Pillow 필요
python run.pyw                    # 또는 pythonw run.pyw
```

## 단독 실행 파일(.exe) 만들기

Python 설치 없이 배포하려면 PyInstaller 로 `.exe` 를 만들 수 있습니다.

```bash
pip install pyinstaller
python scripts/build_exe.py
# 결과물: dist/ChineseBar.exe  (더블클릭 실행 = 하단 가로바)
```

## Windows 시작 시 자동 실행

1. `Win + R` → `shell:startup` 입력 → 엔터 (시작프로그램 폴더가 열림)
2. `run_bar.pyw`(또는 만든 `ChineseBar.exe`)의 **바로 가기**를 그 폴더에 넣기

## 설정 저장 위치

급수·간격·바 위치·글자 크기 등은 아래 파일에 자동 저장됩니다.

- Windows: `%APPDATA%\ChineseTaskbar\config.json`
- macOS/Linux: `~/.config/chinese-taskbar/config.json`

## 프로젝트 구조

```
taskbar-widget/
├── data/hsk-words.json          # HSK 1~6급 단어 데이터 (4,991개)
├── src/chinese_taskbar/
│   ├── bar.py                   # ① 하단 가로바 (tkinter, 추가 설치 불필요)
│   ├── app.py                   # ② 트레이 아이콘 + 알림 (pystray)
│   ├── icon.py                  # 한자 → 트레이 아이콘 렌더링
│   ├── words.py                 # 단어 로딩 / 레벨 필터 / 셔플
│   └── config.py                # 설정 저장·불러오기
├── scripts/build_exe.py         # PyInstaller 빌드 스크립트
├── run_bar.pyw                  # ① 가로바 진입점
├── run.pyw                      # ② 트레이 진입점
└── requirements.txt             # ② 트레이용 의존성
```

## 참고

- **Windows 제약**: Windows 11 은 앱이 작업표시줄 안에 직접 글자를 넣는 것(구 Deskband)을 막아 두었습니다.
  그래서 이 앱은 작업표시줄 바로 위에 항상 떠 있는 얇은 바로 같은 효과를 냅니다.
- 가로바(①)는 macOS/Linux 에서도 tkinter 가 있으면 동작합니다.
- 단어 데이터는 [chinese-learning-app](https://github.com/lj962774-cpu/chinese-learning-app) 의 HSK 데이터셋을 사용합니다.

## 라이선스

MIT
