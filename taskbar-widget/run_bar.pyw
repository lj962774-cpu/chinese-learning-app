"""하단 가로바 실행용 진입점 (.pyw = 콘솔 창 없이 실행).

소스에서 바로 실행:  pythonw run_bar.pyw   또는   python run_bar.pyw
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from chinese_taskbar.bar import main  # noqa: E402

if __name__ == "__main__":
    main()
