#!/usr/bin/env python3
"""Ensure each Rubik base color texture has six unique face colors."""
from __future__ import annotations

import math
from collections import deque
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[1]
TEXTURE_DIR = REPO_ROOT / "public" / "textures"

# Palettes with duplicate face colors get patched using these targets.
PALETTES: Dict[str, Sequence[str]] = {
    "aurora": ["#9370DA", "#00FF7F", "#4169E1", "#FF69B4", "#00CED1", "#BA55D3"],
    "candy": ["#87CDEA", "#FF69B4", "#98FB98", "#DDA0DD", "#FFD580", "#FFD1DC"],
    "classic": ["#00B040", "#FFD700", "#B90000", "#D0D0D0", "#FF6600", "#0046AD"],
    "fire": ["#FED600", "#FF4500", "#FF0000", "#FFFF00", "#FF6600", "#8B0000"],
    "forest": ["#00FE00", "#32CD32", "#006400", "#ADFF2F", "#228B22", "#8B4513"],
    "galaxy": ["#0000FE", "#9400D3", "#FF00FF", "#00FFFF", "#4B0082", "#00BFFF"],
    "ice": ["#00BEFE", "#24A9FF", "#B0E0E6", "#E0FFFF", "#66D9FF", "#F8F8FF"],
    "miami": ["#00FE9E", "#FFEB3B", "#FF1493", "#9B59B6", "#FF6B6B", "#40E0D0"],
    "neonTokyo": ["#00D3FE", "#39FF14", "#FFFFFF", "#FF8C00", "#FF1493", "#9400D3"],
    "ocean": ["#00FE7E", "#00CED1", "#4169E1", "#87CEEB", "#20B2AA", "#005F73"],
    "sunset": ["#FE8C00", "#FFD700", "#C71585", "#FF1493", "#FF6347", "#FF4500"],
}

THRESHOLD = 12.0  # Distance from background needed to count as a face pixel.
MIN_COMPONENT_SIZE = 20000  # Ignore tiny flecks from compression noise.


def hex_to_rgb(color: str) -> Tuple[int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def segment_faces(arr: np.ndarray) -> Tuple[List[dict], np.ndarray]:
    """Return face component metadata sorted by on-screen placement."""
    h, w, _ = arr.shape
    bg = arr[:40, :40].astype(np.float32).mean(axis=(0, 1))
    diff = np.sqrt(np.sum((arr.astype(np.float32) - bg) ** 2, axis=2))
    mask = diff > THRESHOLD

    labels = np.full((h, w), -1, dtype=np.int32)
    comps = []
    comp_id = 0
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or labels[y, x] != -1:
                continue
            queue = deque([(y, x)])
            labels[y, x] = comp_id
            miny = maxy = y
            minx = maxx = x
            size = 0

            while queue:
                cy, cx = queue.pop()
                size += 1
                miny = min(miny, cy)
                maxy = max(maxy, cy)
                minx = min(minx, cx)
                maxx = max(maxx, cx)
                for ny in range(cy - 1, cy + 2):
                    for nx in range(cx - 1, cx + 2):
                        if (
                            0 <= ny < h
                            and 0 <= nx < w
                            and mask[ny, nx]
                            and labels[ny, nx] == -1
                        ):
                            labels[ny, nx] = comp_id
                            queue.append((ny, nx))

            if size >= MIN_COMPONENT_SIZE:
                cy = (miny + maxy) / 2.0
                cx = (minx + maxx) / 2.0
                comps.append({"id": comp_id, "cy": cy, "cx": cx})
            comp_id += 1

    comps.sort(key=lambda c: (c["cy"], c["cx"]))
    return comps, labels


def recolor_texture(texture_name: str, palette: Sequence[str]) -> None:
    path = TEXTURE_DIR / f"Rubik_baseColor_{texture_name}.png"
    if not path.exists():
        raise FileNotFoundError(f"Missing texture {path}")

    arr = np.array(Image.open(path).convert("RGB"))
    comps, labels = segment_faces(arr)
    if len(comps) != len(palette):
        raise ValueError(
            f"{texture_name} expected {len(palette)} faces, found {len(comps)}"
        )

    rgb_palette = list(map(hex_to_rgb, palette))
    for comp, color in zip(comps, rgb_palette):
        mask = labels == comp["id"]
        arr[mask] = color

    Image.fromarray(arr).save(path)
    print(f"Updated {texture_name} -> {path}")


def main() -> None:
    for name, palette in PALETTES.items():
        recolor_texture(name, palette)


if __name__ == "__main__":
    main()
