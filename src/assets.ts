// Smart PNG Sprite Loader with automatic corner-seeded flood-fill background removal,
// green-screen despill, and tight bounding-box cropping.

export type SpriteAssetKey =
  | 'kaelen'
  | 'sura'
  | 'vesper'
  | 'cassian'
  | 'kobold_scavenger'
  | 'obsidian_hound'
  | 'ward_golem'
  | 'inquisitor_vane'
  | 'siege_golem';

const ASSET_URLS: Record<SpriteAssetKey, string> = {
  kaelen: '/assets/kaelen.png',
  sura: '/assets/sura.png',
  vesper: '/assets/vesper.png',
  cassian: '/assets/cassian.png',
  kobold_scavenger: '/assets/kobold.png',
  obsidian_hound: '/assets/hound.png',
  ward_golem: '/assets/golem.png',
  inquisitor_vane: '/assets/vane.png',
  siege_golem: '/assets/siege_golem.png',
};

const processedSprites = new Map<SpriteAssetKey, HTMLCanvasElement>();
const loadingState = new Map<SpriteAssetKey, boolean>();

function removeBackgroundAndCrop(img: HTMLImageElement): HTMLCanvasElement {
  const workW = img.naturalWidth || img.width;
  const workH = img.naturalHeight || img.height;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = workW;
  tempCanvas.height = workH;
  const ctx = tempCanvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, workW, workH);
  const data = imgData.data;

  // Sample corner background color
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const isBgPixel = (idx: number): boolean => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a < 25) return true;

    // Distance to corner color
    const distCorner = Math.hypot(r - bgR, g - bgG, b - bgB);
    if (distCorner < 68) return true;

    // Also check pure chroma green dominance (#00FF00 family)
    if (g > 135 && g > r * 1.35 && g > b * 1.35) return true;

    return false;
  };

  // Flood-fill from all 4 border edges so internal green armor/eyes on Sura aren't erased!
  const visited = new Uint8Array(workW * workH);
  const queue = new Int32Array(workW * workH);
  let head = 0;
  let tail = 0;

  const pushSeed = (x: number, y: number) => {
    const pos = y * workW + x;
    if (visited[pos]) return;
    if (isBgPixel(pos * 4)) {
      visited[pos] = 1;
      queue[tail++] = pos;
    }
  };

  for (let x = 0; x < workW; x++) {
    pushSeed(x, 0);
    pushSeed(x, workH - 1);
  }
  for (let y = 0; y < workH; y++) {
    pushSeed(0, y);
    pushSeed(workW - 1, y);
  }

  while (head < tail) {
    const pos = queue[head++];
    const idx = pos * 4;
    data[idx + 3] = 0; // Make transparent

    const x = pos % workW;
    const y = (pos - x) / workW;

    if (x > 0) pushSeed(x - 1, y);
    if (x + 1 < workW) pushSeed(x + 1, y);
    if (y > 0) pushSeed(x, y - 1);
    if (y + 1 < workH) pushSeed(x, y + 1);
  }

  // Edge despill: soften green fringe on pixels bordering transparent background
  for (let y = 1; y < workH - 1; y++) {
    for (let x = 1; x < workW - 1; x++) {
      const pos = y * workW + x;
      const idx = pos * 4;
      if (data[idx + 3] === 0) continue;

      const touchesBg =
        visited[pos - 1] ||
        visited[pos + 1] ||
        visited[pos - workW] ||
        visited[pos + workW];

      if (touchesBg) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (g > r && g > b) {
          data[idx + 1] = Math.round((r + b) * 0.5);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Find tight bounding box of non-transparent pixels
  let minX = workW;
  let minY = workH;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      const a = data[(y * workW + x) * 4 + 3];
      if (a > 30) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return tempCanvas;
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.drawImage(tempCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  return outCanvas;
}

const assetListeners: (() => void)[] = [];

export function onSpriteAssetReady(cb: () => void): void {
  assetListeners.push(cb);
}

export function preloadAllSprites(): void {
  (Object.keys(ASSET_URLS) as SpriteAssetKey[]).forEach((key) => {
    if (processedSprites.has(key) || loadingState.get(key)) return;
    loadingState.set(key, true);

    const img = new Image();
    img.onload = () => {
      try {
        const cleaned = removeBackgroundAndCrop(img);
        processedSprites.set(key, cleaned);
        assetListeners.forEach((cb) => cb());
      } catch {
        // Fallback to procedural sprite if processing fails
      }
    };
    img.onerror = () => {
      loadingState.set(key, false);
    };
    img.src = `${ASSET_URLS[key]}?t=${Date.now()}`;
  });
}

export function getLoadedSprite(key: SpriteAssetKey): HTMLCanvasElement | null {
  if (!processedSprites.has(key) && !loadingState.get(key)) {
    preloadAllSprites();
  }
  return processedSprites.get(key) || null;
}
