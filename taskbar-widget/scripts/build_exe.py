"""PyInstaller 로 단일 실행 파일(.exe)을 만든다.

사용법 (Windows):
    pip install pyinstaller
    python scripts/build_exe.py

결과물: dist/ChineseTaskbar.exe  (더블클릭으로 실행, 콘솔 창 없음)
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "hsk-words.json"
# 기본은 하단 가로바(run_bar.pyw). 트레이 버전을 빌드하려면 run.pyw 로 바꾸세요.
ENTRY = ROOT / "run_bar.pyw"

# PyInstaller 의 --add-data 구분자는 Windows 는 ';', 그 외는 ':'
sep = ";" if sys.platform.startswith("win") else ":"


def main() -> int:
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--noconsole",
        "--name", "ChineseBar",
        "--add-data", f"{DATA}{sep}data",
        "--paths", str(ROOT / "src"),
        str(ENTRY),
    ]
    print("실행:", " ".join(cmd))
    return subprocess.call(cmd, cwd=ROOT)


if __name__ == "__main__":
    raise SystemExit(main())
