"""작업표시줄(시스템 트레이)에 HSK 중국어 단어를 띄우는 메인 앱."""

from __future__ import annotations

import threading
import webbrowser
from pathlib import Path

import pystray
from pystray import Menu, MenuItem

from .config import Config, config_dir
from .icon import make_icon
from .words import Word, WordDeck, load_words

INTERVAL_CHOICES = [
    ("10초", 10),
    ("30초", 30),
    ("1분", 60),
    ("3분", 180),
    ("5분", 300),
    ("10분", 600),
]


class ChineseTaskbarApp:
    def __init__(self) -> None:
        self.config = Config.load()
        self.words = load_words()
        self.deck = WordDeck(
            self.words,
            levels=set(self.config.levels),
            shuffle=self.config.shuffle,
        )
        self._stop = threading.Event()   # 종료 신호
        self._tick = threading.Event()   # 인터벌 변경 시 대기 깨우기
        self._timer_thread: threading.Thread | None = None
        self.icon = pystray.Icon(
            "chinese_taskbar",
            icon=self._render(self.deck.current()),
            title=self.deck.current().tooltip,
            menu=self._build_menu(),
        )

    # ---------- 표시 갱신 ----------
    def _render(self, word: Word):
        return make_icon(word.hanzi, word.level, size=64)

    def _refresh(self, word: Word) -> None:
        self.icon.icon = self._render(word)
        self.icon.title = word.tooltip
        self.icon.update_menu()

    def _notify(self, word: Word) -> None:
        if not self.config.notify:
            return
        try:
            self.icon.notify(word.notify_message, word.notify_title)
        except Exception:
            # 일부 백엔드는 notify 미지원 → 조용히 무시
            pass

    def _show(self, word: Word, notify: bool = False) -> None:
        self._refresh(word)
        if notify:
            self._notify(word)

    # ---------- 자동 넘김 스레드 ----------
    def _run_timer(self) -> None:
        while not self._stop.is_set():
            interval = max(5, self.config.interval_seconds)
            # 인터벌만큼 대기하되, 설정 변경/종료 시 즉시 깨어난다.
            woke = self._tick.wait(timeout=interval)
            self._tick.clear()
            if self._stop.is_set():
                break
            if woke:
                # 설정 변경으로 깬 경우엔 넘기지 않고 새 인터벌로 다시 대기
                continue
            if self.config.auto_advance:
                self._show(self.deck.next(), notify=True)

    # ---------- 메뉴 액션 ----------
    def _action_next(self, _=None) -> None:
        self._show(self.deck.next(), notify=False)

    def _action_prev(self, _=None) -> None:
        self._show(self.deck.prev(), notify=False)

    def _action_notify_now(self, _=None) -> None:
        self._notify(self.deck.current())

    def _toggle_level(self, level: int):
        def handler(_=None):
            levels = self.deck.levels
            if level in levels:
                levels.discard(level)
            else:
                levels.add(level)
            if not levels:
                levels = {level}  # 최소 1개 유지
            self.deck.set_levels(levels)
            self.config.levels = sorted(levels)
            self.config.save()
            self._show(self.deck.current())
        return handler

    def _set_interval(self, seconds: int):
        def handler(_=None):
            self.config.interval_seconds = seconds
            self.config.save()
            self._tick.set()  # 대기 중인 타이머를 새 인터벌로 재시작
        return handler

    def _toggle_shuffle(self, _=None) -> None:
        self.config.shuffle = not self.config.shuffle
        self.config.save()
        self.deck.set_shuffle(self.config.shuffle)
        self._show(self.deck.current())

    def _toggle_auto(self, _=None) -> None:
        self.config.auto_advance = not self.config.auto_advance
        self.config.save()
        self.icon.update_menu()

    def _toggle_notify(self, _=None) -> None:
        self.config.notify = not self.config.notify
        self.config.save()
        self.icon.update_menu()

    def _open_config_dir(self, _=None) -> None:
        try:
            webbrowser.open(config_dir().as_uri())
        except Exception:
            pass

    def _quit(self, _=None) -> None:
        self._stop.set()
        self._tick.set()
        self.icon.stop()

    # ---------- 메뉴 구성 ----------
    def _current_label(self, _item=None) -> str:
        w = self.deck.current()
        return f"{w.hanzi}  [{w.pinyin}]"

    def _current_meaning(self, _item=None) -> str:
        w = self.deck.current()
        meaning = w.meaning if len(w.meaning) <= 40 else w.meaning[:40] + "…"
        return f"   {meaning}  ·  HSK {w.level}"

    def _build_menu(self) -> Menu:
        level_items = [
            MenuItem(
                f"HSK {lv}",
                self._toggle_level(lv),
                checked=lambda _i, lv=lv: lv in self.deck.levels,
            )
            for lv in range(1, 7)
        ]
        interval_items = [
            MenuItem(
                label,
                self._set_interval(secs),
                checked=lambda _i, secs=secs: self.config.interval_seconds == secs,
                radio=True,
            )
            for label, secs in INTERVAL_CHOICES
        ]
        return Menu(
            MenuItem(self._current_label, self._action_notify_now, default=True),
            MenuItem(self._current_meaning, None, enabled=False),
            Menu.SEPARATOR,
            MenuItem("다음 단어 ▶", self._action_next),
            MenuItem("◀ 이전 단어", self._action_prev),
            MenuItem("알림으로 다시 보기", self._action_notify_now),
            Menu.SEPARATOR,
            MenuItem("급수(HSK) 선택", Menu(*level_items)),
            MenuItem("자동 넘김 간격", Menu(*interval_items)),
            MenuItem(
                "자동 넘김",
                self._toggle_auto,
                checked=lambda _i: self.config.auto_advance,
            ),
            MenuItem(
                "알림 팝업",
                self._toggle_notify,
                checked=lambda _i: self.config.notify,
            ),
            MenuItem(
                "무작위 순서",
                self._toggle_shuffle,
                checked=lambda _i: self.config.shuffle,
            ),
            Menu.SEPARATOR,
            MenuItem("설정 폴더 열기", self._open_config_dir),
            MenuItem("종료", self._quit),
        )

    # ---------- 실행 ----------
    def _on_ready(self, icon: pystray.Icon) -> None:
        icon.visible = True
        self._timer_thread = threading.Thread(target=self._run_timer, daemon=True)
        self._timer_thread.start()
        # 시작 알림
        self._notify(self.deck.current())

    def run(self) -> None:
        self.icon.run(setup=self._on_ready)


def main() -> None:
    ChineseTaskbarApp().run()


if __name__ == "__main__":
    main()
