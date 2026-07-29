"""더블클릭 실행용 진입점 (.pyw 확장자는 콘솔 창 없이 실행됨).

소스에서 바로 실행할 때 사용한다:  pythonw run.pyw
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from chinese_taskbar.app import main  # noqa: E402

if __name__ == "__main__":
    main()
