"""화면 하단에 항상 떠 있는 가로바로 HSK 단어를 상시 표시한다.

작업표시줄 바로 위에 얇은 바가 뜨고, 단어·병음(성조)·뜻·급수가 글자로 계속 보인다.
tkinter(파이썬 기본 내장)만 사용하므로 추가 설치가 필요 없다.

  - 왼쪽 클릭: 다음 단어
  - 왼쪽 드래그: 바 위치 이동(자동 저장)
  - 오른쪽 클릭: 메뉴(급수/간격/자동넘김/위치초기화/종료)
"""

from __future__ import annotations

import tkinter as tk
import tkinter.font as tkfont

from .config import Config
from .words import Word, WordDeck, load_words

# 색상 (다크 바)
BG = "#1f2430"
FG_HANZI = "#ffffff"
FG_PINYIN = "#8ab4f8"
FG_MEANING = "#e8e8e8"
LEVEL_FG = {
    1: "#57d977", 2: "#6ea8fe", 3: "#c6a0f6",
    4: "#f0a35e", 5: "#f16d6d", 6: "#c8ccd4",
}

# 한자용 / 한글(뜻)용 폰트 후보 (Windows 우선)
HANZI_FAMILIES = ["Microsoft YaHei", "SimHei", "SimSun", "Malgun Gothic",
                  "PingFang SC", "WenQuanYi Zen Hei", "Noto Sans CJK SC"]
TEXT_FAMILIES = ["Malgun Gothic", "맑은 고딕", "Microsoft YaHei", "Segoe UI",
                 "Noto Sans CJK KR", "sans-serif"]

INTERVAL_CHOICES = [("10초", 10), ("30초", 30), ("1분", 60),
                    ("3분", 180), ("5분", 300), ("10분", 600)]

DRAG_THRESHOLD = 4  # 이 픽셀 미만 이동은 '클릭'으로 간주


def _pick_family(candidates: list[str], available: set[str]) -> str:
    for fam in candidates:
        if fam in available:
            return fam
    return candidates[0]


class WordBar:
    def __init__(self) -> None:
        self.config = Config.load()
        self.words = load_words()
        self.deck = WordDeck(self.words, set(self.config.levels), self.config.shuffle)

        self.root = tk.Tk()
        self.root.title("Chinese Taskbar")
        self.root.overrideredirect(True)      # 테두리/제목표시줄 없음
        self.root.attributes("-topmost", True)  # 항상 위
        self.root.configure(bg=BG)

        available = set(tkfont.families(self.root))
        fs = self.config.font_size
        self.f_hanzi = tkfont.Font(
            family=_pick_family(HANZI_FAMILIES, available), size=fs + 4, weight="bold")
        self.f_pinyin = tkfont.Font(
            family=_pick_family(TEXT_FAMILIES, available), size=fs, slant="italic")
        self.f_text = tkfont.Font(
            family=_pick_family(TEXT_FAMILIES, available), size=fs)
        self.f_level = tkfont.Font(
            family=_pick_family(TEXT_FAMILIES, available), size=max(8, fs - 2), weight="bold")

        self._after_id: str | None = None
        self._drag = {"x": 0, "y": 0, "ox": 0, "oy": 0, "moved": False}

        self._build_widgets()
        self._show(self.deck.current())
        self._place_window()
        self._bind_events()
        self._schedule_tick()

    # ---------- 위젯 ----------
    def _build_widgets(self) -> None:
        pad = {"padx": (10, 6), "pady": 4}
        self.frame = tk.Frame(self.root, bg=BG)
        self.frame.pack(fill="both", expand=True)

        self.lbl_hanzi = tk.Label(self.frame, font=self.f_hanzi, fg=FG_HANZI, bg=BG)
        self.lbl_hanzi.pack(side="left", **pad)
        self.lbl_pinyin = tk.Label(self.frame, font=self.f_pinyin, fg=FG_PINYIN, bg=BG)
        self.lbl_pinyin.pack(side="left", padx=(0, 6))
        self.lbl_meaning = tk.Label(self.frame, font=self.f_text, fg=FG_MEANING, bg=BG,
                                    anchor="w")
        self.lbl_meaning.pack(side="left", padx=(0, 12))
        self.lbl_level = tk.Label(self.frame, font=self.f_level, bg=BG)
        self.lbl_level.pack(side="right", padx=(6, 12))

        self._widgets = [self.root, self.frame, self.lbl_hanzi, self.lbl_pinyin,
                         self.lbl_meaning, self.lbl_level]

    def _show(self, word: Word) -> None:
        meaning = word.meaning if len(word.meaning) <= 30 else word.meaning[:30] + "…"
        self.lbl_hanzi.config(text=word.hanzi)
        self.lbl_pinyin.config(text=f"[{word.pinyin}]")
        self.lbl_meaning.config(text=meaning)
        self.lbl_level.config(text=f"HSK{word.level}", fg=LEVEL_FG.get(word.level, "#cccccc"))
        self.root.attributes("-topmost", True)
        self.root.update_idletasks()

    # ---------- 위치 ----------
    def _place_window(self) -> None:
        self.root.update_idletasks()
        w = self.root.winfo_reqwidth()
        h = self.root.winfo_reqheight()
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        x = self.config.bar_x
        y = self.config.bar_y
        if x is None:
            x = sw - w - 20                       # 기본: 우측
        if y is None:
            y = sh - h - self.config.bottom_margin  # 기본: 작업표시줄 위
        # 화면 밖으로 나가지 않게 보정
        x = max(0, min(x, sw - w))
        y = max(0, min(y, sh - h))
        self.root.geometry(f"{w}x{h}+{int(x)}+{int(y)}")

    def _reset_position(self) -> None:
        self.config.bar_x = None
        self.config.bar_y = None
        self.config.save()
        self._place_window()

    # ---------- 이벤트 ----------
    def _bind_events(self) -> None:
        for wdg in self._widgets:
            wdg.bind("<Button-1>", self._on_press)
            wdg.bind("<B1-Motion>", self._on_motion)
            wdg.bind("<ButtonRelease-1>", self._on_release)
            wdg.bind("<Button-3>", self._on_menu)

    def _on_press(self, event: "tk.Event") -> None:
        self._drag.update(
            x=event.x_root, y=event.y_root,
            ox=self.root.winfo_x(), oy=self.root.winfo_y(), moved=False)

    def _on_motion(self, event: "tk.Event") -> None:
        dx = event.x_root - self._drag["x"]
        dy = event.y_root - self._drag["y"]
        if abs(dx) > DRAG_THRESHOLD or abs(dy) > DRAG_THRESHOLD:
            self._drag["moved"] = True
        if self._drag["moved"]:
            self.root.geometry(f"+{self._drag['ox'] + dx}+{self._drag['oy'] + dy}")

    def _on_release(self, event: "tk.Event") -> None:
        if self._drag["moved"]:
            self.config.bar_x = self.root.winfo_x()
            self.config.bar_y = self.root.winfo_y()
            self.config.save()
        else:
            self._next()

    # ---------- 단어 넘김 ----------
    def _next(self) -> None:
        self._show(self.deck.next())
        self._place_window()

    def _schedule_tick(self) -> None:
        if self._after_id is not None:
            self.root.after_cancel(self._after_id)
            self._after_id = None
        interval = max(5, self.config.interval_seconds)
        self._after_id = self.root.after(interval * 1000, self._tick)

    def _tick(self) -> None:
        if self.config.auto_advance:
            self._show(self.deck.next())
            self._place_window()
        self._schedule_tick()

    # ---------- 우클릭 메뉴 ----------
    def _on_menu(self, event: "tk.Event") -> None:
        menu = tk.Menu(self.root, tearoff=0)
        menu.add_command(label="다음 단어 ▶", command=self._next)

        lv_menu = tk.Menu(menu, tearoff=0)
        for lv in range(1, 7):
            lv_menu.add_checkbutton(
                label=f"HSK {lv}",
                onvalue=True, offvalue=False,
                variable=tk.BooleanVar(value=lv in self.deck.levels),
                command=lambda lv=lv: self._toggle_level(lv))
        menu.add_cascade(label="급수(HSK) 선택", menu=lv_menu)

        iv_menu = tk.Menu(menu, tearoff=0)
        cur_iv = tk.IntVar(value=self.config.interval_seconds)
        for label, secs in INTERVAL_CHOICES:
            iv_menu.add_radiobutton(
                label=label, value=secs, variable=cur_iv,
                command=lambda secs=secs: self._set_interval(secs))
        menu.add_cascade(label="자동 넘김 간격", menu=iv_menu)

        menu.add_checkbutton(
            label="자동 넘김", onvalue=True, offvalue=False,
            variable=tk.BooleanVar(value=self.config.auto_advance),
            command=self._toggle_auto)
        menu.add_checkbutton(
            label="무작위 순서", onvalue=True, offvalue=False,
            variable=tk.BooleanVar(value=self.config.shuffle),
            command=self._toggle_shuffle)
        menu.add_separator()
        menu.add_command(label="글자 크게", command=lambda: self._change_font(2))
        menu.add_command(label="글자 작게", command=lambda: self._change_font(-2))
        menu.add_command(label="위치 초기화", command=self._reset_position)
        menu.add_separator()
        menu.add_command(label="종료", command=self._quit)
        try:
            menu.tk_popup(event.x_root, event.y_root)
        finally:
            menu.grab_release()

    def _toggle_level(self, level: int) -> None:
        levels = self.deck.levels
        levels.discard(level) if level in levels else levels.add(level)
        if not levels:
            levels = {level}
        self.deck.set_levels(levels)
        self.config.levels = sorted(levels)
        self.config.save()
        self._show(self.deck.current())
        self._place_window()

    def _set_interval(self, secs: int) -> None:
        self.config.interval_seconds = secs
        self.config.save()
        self._schedule_tick()

    def _toggle_auto(self) -> None:
        self.config.auto_advance = not self.config.auto_advance
        self.config.save()

    def _toggle_shuffle(self) -> None:
        self.config.shuffle = not self.config.shuffle
        self.config.save()
        self.deck.set_shuffle(self.config.shuffle)
        self._show(self.deck.current())

    def _change_font(self, delta: int) -> None:
        self.config.font_size = self.config.font_size + delta
        self.config.save()  # sanitize 가 범위 제한
        fs = self.config.font_size
        self.f_hanzi.config(size=fs + 4)
        self.f_pinyin.config(size=fs)
        self.f_text.config(size=fs)
        self.f_level.config(size=max(8, fs - 2))
        self._place_window()

    def _quit(self) -> None:
        if self._after_id is not None:
            self.root.after_cancel(self._after_id)
        self.root.destroy()

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    WordBar().run()


if __name__ == "__main__":
    main()
