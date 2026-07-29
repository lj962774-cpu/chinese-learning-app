"""한자를 그려 넣은 트레이 아이콘 이미지를 생성한다."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# 레벨별 배경색 (HSK 1 → 6, 쉬움→어려움 그라데이션 느낌)
LEVEL_COLORS = {
    1: (46, 160, 67),    # green
    2: (56, 139, 253),   # blue
    3: (163, 113, 247),  # purple
    4: (219, 109, 40),   # orange
    5: (218, 54, 51),    # red
    6: (110, 118, 129),  # gray
}
DEFAULT_BG = (36, 41, 47)

# 한자를 렌더링할 CJK 폰트 후보 (OS별)
_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",     # Microsoft YaHei (Windows)
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\simsun.ttc",
    "/System/Library/Fonts/PingFang.ttc",             # macOS
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",   # Linux (WenQuanYi)
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
]


@lru_cache(maxsize=None)
def _font_path() -> str | None:
    for p in _FONT_CANDIDATES:
        if Path(p).is_file():
            return p
    return None


@lru_cache(maxsize=32)
def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    fp = _font_path()
    if fp:
        try:
            return ImageFont.truetype(fp, size)
        except OSError:
            pass
    return ImageFont.load_default()


def make_icon(hanzi: str, level: int = 0, size: int = 64) -> Image.Image:
    """한자(1~2글자)를 그린 정사각형 아이콘 이미지를 반환."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    bg = LEVEL_COLORS.get(level, DEFAULT_BG)
    radius = max(6, size // 6)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=bg)

    # 한자가 길면 앞의 최대 2글자만 표시 (아이콘은 작으므로)
    text = (hanzi or "?")[:2]
    # 글자 수에 맞춰 폰트 크기 결정
    font_size = int(size * (0.62 if len(text) == 1 else 0.46))
    font = _font(font_size)

    # 중앙 정렬 (anchor="mm" 는 truetype 폰트에서 동작)
    try:
        draw.text((size / 2, size / 2 - size * 0.04), text, font=font,
                  fill=(255, 255, 255, 255), anchor="mm")
    except (TypeError, ValueError):
        # 기본 폰트 폴백: anchor 미지원 시 수동 중앙 정렬
        bbox = draw.textbbox((0, 0), text, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]),
                  text, font=font, fill=(255, 255, 255, 255))
    return img
