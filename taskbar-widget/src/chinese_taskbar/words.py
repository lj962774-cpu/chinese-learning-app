"""HSK 단어 데이터 로딩 및 순회 관리."""

from __future__ import annotations

import json
import random
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Word:
    """HSK 단어 한 개."""

    id: str
    hanzi: str
    pinyin: str
    meaning: str
    level: int
    pos: str = ""
    en: str = ""
    example_hanzi: str = ""
    example_pinyin: str = ""
    example_meaning: str = ""

    @classmethod
    def from_dict(cls, d: dict) -> "Word":
        ex = d.get("example") or {}
        return cls(
            id=str(d.get("id", "")),
            hanzi=str(d.get("hanzi", "")),
            pinyin=str(d.get("pinyin", "")),
            meaning=str(d.get("meaning", "")),
            level=int(d.get("level", 0) or 0),
            pos=str(d.get("pos", "") or ""),
            en=str(d.get("en", "") or ""),
            example_hanzi=str(ex.get("hanzi", "") or ""),
            example_pinyin=str(ex.get("pinyin", "") or ""),
            example_meaning=str(ex.get("meaning", "") or ""),
        )

    @property
    def tooltip(self) -> str:
        """트레이 아이콘 툴팁 문자열 (Windows 툴팁 길이 제한 고려)."""
        text = f"{self.hanzi}  [{self.pinyin}]\n{self.meaning}"
        return text[:120]

    @property
    def notify_title(self) -> str:
        return f"{self.hanzi}  ·  HSK {self.level}"

    @property
    def notify_message(self) -> str:
        lines = [f"[{self.pinyin}]", self.meaning]
        if self.example_hanzi:
            lines.append("")
            lines.append(self.example_hanzi)
            if self.example_meaning:
                lines.append(self.example_meaning)
        return "\n".join(lines)[:250]


def data_file() -> Path:
    """번들(PyInstaller) 및 소스 실행 양쪽에서 데이터 파일 경로를 찾는다."""
    candidates = []
    # PyInstaller onefile: 데이터는 _MEIPASS 에 풀린다.
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        candidates.append(Path(meipass) / "data" / "hsk-words.json")
    here = Path(__file__).resolve()
    # src/chinese_taskbar/words.py -> 레포 루트/data/hsk-words.json
    candidates.append(here.parents[2] / "data" / "hsk-words.json")
    candidates.append(here.parent / "data" / "hsk-words.json")
    candidates.append(Path.cwd() / "data" / "hsk-words.json")
    for c in candidates:
        if c.is_file():
            return c
    raise FileNotFoundError(
        "hsk-words.json 을 찾을 수 없습니다. 확인한 경로:\n  "
        + "\n  ".join(str(c) for c in candidates)
    )


def load_words(path: Path | None = None) -> list[Word]:
    p = path or data_file()
    with p.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    words = [Word.from_dict(d) for d in raw if d.get("hanzi")]
    if not words:
        raise ValueError("단어 데이터가 비어 있습니다.")
    return words


class WordDeck:
    """레벨 필터·셔플·현재 위치를 관리하는 단어 덱."""

    def __init__(self, words: list[Word], levels: set[int] | None = None, shuffle: bool = True):
        self._all = words
        self._levels = levels or set(range(1, 7))
        self._shuffle = shuffle
        self._order: list[int] = []
        self._pos = 0
        self.rebuild()

    @property
    def levels(self) -> set[int]:
        return set(self._levels)

    def set_levels(self, levels: set[int]) -> None:
        self._levels = set(levels) or {1}
        self.rebuild()

    def set_shuffle(self, shuffle: bool) -> None:
        self._shuffle = shuffle
        self.rebuild()

    def rebuild(self) -> None:
        pool = [i for i, w in enumerate(self._all) if w.level in self._levels]
        if not pool:  # 안전장치: 필터 결과가 비면 전체 사용
            pool = list(range(len(self._all)))
        if self._shuffle:
            random.shuffle(pool)
        self._order = pool
        self._pos = 0

    def current(self) -> Word:
        return self._all[self._order[self._pos]]

    def next(self) -> Word:
        self._pos += 1
        if self._pos >= len(self._order):
            self.rebuild()  # 한 바퀴 다 돌면 다시 섞는다
        return self.current()

    def prev(self) -> Word:
        self._pos = (self._pos - 1) % len(self._order)
        return self.current()

    def __len__(self) -> int:
        return len(self._order)
