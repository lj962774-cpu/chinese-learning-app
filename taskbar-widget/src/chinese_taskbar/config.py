"""사용자 설정 저장/불러오기 (%APPDATA%/ChineseTaskbar/config.json)."""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from pathlib import Path


def config_dir() -> Path:
    """OS별 설정 디렉터리. Windows는 %APPDATA%."""
    base = os.environ.get("APPDATA")
    if base:
        return Path(base) / "ChineseTaskbar"
    # macOS / Linux 폴백
    xdg = os.environ.get("XDG_CONFIG_HOME")
    home = Path(xdg) if xdg else Path.home() / ".config"
    return home / "chinese-taskbar"


@dataclass
class Config:
    levels: list[int] = field(default_factory=lambda: [1, 2, 3, 4, 5, 6])
    interval_seconds: int = 60
    shuffle: bool = True
    notify: bool = True
    auto_advance: bool = True
    # 하단 가로바(WordBar) 전용 설정
    font_size: int = 14
    bottom_margin: int = 48          # 작업표시줄 높이만큼 띄우는 여백(px)
    bar_x: int | None = None         # 저장된 바 위치(없으면 기본 우측 하단)
    bar_y: int | None = None

    @classmethod
    def load(cls) -> "Config":
        path = config_dir() / "config.json"
        if not path.is_file():
            return cls()
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return cls()
        cfg = cls()
        for k, v in data.items():
            if hasattr(cfg, k):
                setattr(cfg, k, v)
        cfg.sanitize()
        return cfg

    def sanitize(self) -> None:
        self.levels = sorted({int(x) for x in self.levels if 1 <= int(x) <= 6}) or [1]
        self.interval_seconds = max(5, int(self.interval_seconds))
        self.shuffle = bool(self.shuffle)
        self.notify = bool(self.notify)
        self.auto_advance = bool(self.auto_advance)
        self.font_size = min(48, max(8, int(self.font_size)))
        self.bottom_margin = min(400, max(0, int(self.bottom_margin)))
        self.bar_x = None if self.bar_x is None else int(self.bar_x)
        self.bar_y = None if self.bar_y is None else int(self.bar_y)

    def save(self) -> None:
        self.sanitize()
        d = config_dir()
        d.mkdir(parents=True, exist_ok=True)
        (d / "config.json").write_text(
            json.dumps(asdict(self), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
