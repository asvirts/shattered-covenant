// High-detail pixel art utility: renders 2D pixel grids with multi-tone palettes,
// automatic 1px dark silhouette outlines, inner specular highlights, and offscreen caching.

export type PaletteMap = Record<string, string>;

const spriteCache = new Map<string, HTMLCanvasElement>();

export function clearSpriteCache(): void {
  spriteCache.clear();
}

/**
 * Renders an ASCII pixel matrix into a cached offscreen HTMLCanvasElement,
 * optionally applying a 1px dark pixel-art outline around all non-transparent pixels.
 */
export function getCachedPixelSprite(
  cacheKey: string,
  rows: string[],
  palette: PaletteMap,
  outlineColor: string | null = '#0b0910'
): HTMLCanvasElement {
  const existing = spriteCache.get(cacheKey);
  if (existing) return existing;

  const h = rows.length;
  const w = rows.reduce((max, r) => Math.max(max, r.length), 0);

  // Add 2px padding for 1px outline on all sides
  const canvas = document.createElement('canvas');
  canvas.width = w + 2;
  canvas.height = h + 2;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const filled: boolean[][] = Array.from({ length: h + 2 }, () =>
    Array(w + 2).fill(false)
  );

  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      filled[y + 1][x + 1] = true;
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }
  }

  // Apply crisp 1px dark pixel outline around sprite silhouette
  if (outlineColor) {
    ctx.fillStyle = outlineColor;
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (let y = 1; y <= h; y++) {
      for (let x = 1; x <= w; x++) {
        if (!filled[y][x]) continue;
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (!filled[ny][nx]) {
            ctx.fillRect(nx, ny, 1, 1);
          }
        }
      }
    }
  }

  spriteCache.set(cacheKey, canvas);
  return canvas;
}

/**
 * Applies a 1px pixel-art outline to an arbitrary procedural pixel canvas.
 */
export function applyPixelOutline(
  canvas: HTMLCanvasElement,
  outlineHex = '#0b0910'
): void {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const out = new Uint8ClampedArray(data);

  const rOut = parseInt(outlineHex.slice(1, 3), 16);
  const gOut = parseInt(outlineHex.slice(3, 5), 16);
  const bOut = parseInt(outlineHex.slice(5, 7), 16);

  const isSolid = (x: number, y: number): boolean => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    return data[(y * w + x) * 4 + 3] > 200;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 20) continue;
      if (
        isSolid(x - 1, y) ||
        isSolid(x + 1, y) ||
        isSolid(x, y - 1) ||
        isSolid(x, y + 1)
      ) {
        out[idx] = rOut;
        out[idx + 1] = gOut;
        out[idx + 2] = bOut;
        out[idx + 3] = 255;
      }
    }
  }

  img.data.set(out);
  ctx.putImageData(img, 0, 0);
}
