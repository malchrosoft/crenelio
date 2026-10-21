/**
 * Rognage d'images côté navigateur : PNG via canvas, SVG via son `viewBox` (reste vectoriel).
 * Les zones peuvent déborder de l'image (dézoom) : le débord reste transparent.
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Image source prête pour le rogneur : URL affichable et dimensions de référence. */
export interface CropSource {
  kind: 'png' | 'svg';
  url: string;
  width: number;
  height: number;
  /** SVG normalisé (width/height explicites, viewBox garanti). */
  svg?: string;
}

const PX_LENGTH = /^\s*(\d+(?:\.\d+)?)(px)?\s*$/;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de lire l'image"));
    img.src = url;
  });
}

const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function parseSvg(text: string): SVGSVGElement {
  const root = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
  if (root.nodeName !== 'svg') throw new Error('Fichier SVG invalide');
  return root as unknown as SVGSVGElement;
}

/** Fixe width/height en pixels et un viewBox explicite, pour un repère de rognage fiable. */
function normalizeSvg(text: string): { svg: string; width: number; height: number } {
  const root = parseSvg(text);
  const viewBox = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  const w = PX_LENGTH.exec(root.getAttribute('width') ?? '')?.[1];
  const h = PX_LENGTH.exec(root.getAttribute('height') ?? '')?.[1];

  const width = w ? Number(w) : viewBox?.[2];
  const height = h ? Number(h) : viewBox?.[3];
  if (!width || !height) throw new Error('SVG sans dimensions ni viewBox : impossible de le rogner');

  if (!viewBox || viewBox.length !== 4) root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  return { svg: new XMLSerializer().serializeToString(root), width, height };
}

/** Prépare un fichier PNG ou SVG pour le rogneur. */
export async function toCropSource(file: Blob): Promise<CropSource> {
  if (file.type === 'image/svg+xml') {
    const { svg, width, height } = normalizeSvg(await file.text());
    return { kind: 'svg', url: svgDataUrl(svg), width, height, svg };
  }
  if (file.type !== 'image/png') throw new Error('Formats acceptés : PNG ou SVG');
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  return { kind: 'png', url, width: img.naturalWidth, height: img.naturalHeight };
}

/** SVG rogné : seul le viewBox change, le contenu vectoriel est conservé. */
export function cropSvg(source: CropSource, area: CropArea): string {
  const root = parseSvg(source.svg ?? '');
  const [vx, vy, vw, vh] = root.getAttribute('viewBox')!.split(/[\s,]+/).map(Number);
  const sx = vw / source.width;
  const sy = vh / source.height;
  root.setAttribute('viewBox', [vx + area.x * sx, vy + area.y * sy, area.width * sx, area.height * sy].join(' '));
  root.setAttribute('width', String(Math.round(area.width)));
  root.setAttribute('height', String(Math.round(area.height)));
  return new XMLSerializer().serializeToString(root);
}

/**
 * Zone rognée rendue en PNG, la plus grande dimension bornée à `maxSize`.
 * Avec `upscale`, elle est portée exactement à `maxSize` (favicon de taille fixe).
 */
export async function cropToPng(source: CropSource, area: CropArea, maxSize: number, upscale = false): Promise<Blob> {
  const img = await loadImage(source.url);
  const fit = maxSize / Math.max(area.width, area.height);
  const scale = upscale ? fit : Math.min(1, fit);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  canvas
    .getContext('2d')!
    .drawImage(img, -area.x * scale, -area.y * scale, source.width * scale, source.height * scale);
  return canvasToPng(canvas);
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Conversion PNG impossible'))), 'image/png')
  );
}

/** Redimensionne un PNG carré (favicon) à la taille voulue. */
async function resizePng(png: Blob, size: number): Promise<Blob> {
  const url = URL.createObjectURL(png);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    canvas.getContext('2d')!.drawImage(img, 0, 0, size, size);
    return canvasToPng(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Fichier .ico embarquant des PNG (format admis par tous les navigateurs actuels). */
export async function buildIco(png: Blob, sizes = [16, 32, 48]): Promise<Blob> {
  const images = await Promise.all(sizes.map(async (s) => new Uint8Array(await (await resizePng(png, s)).arrayBuffer())));
  const header = new DataView(new ArrayBuffer(6 + 16 * images.length));
  header.setUint16(2, 1, true); // type : icône
  header.setUint16(4, images.length, true);

  let offset = header.byteLength;
  images.forEach((data, i) => {
    const entry = 6 + 16 * i;
    header.setUint8(entry, sizes[i] % 256); // 0 signifie 256 px
    header.setUint8(entry + 1, sizes[i] % 256);
    header.setUint16(entry + 4, 1, true); // plans
    header.setUint16(entry + 6, 32, true); // bits par pixel
    header.setUint32(entry + 8, data.byteLength, true);
    header.setUint32(entry + 12, offset, true);
    offset += data.byteLength;
  });

  return new Blob([header.buffer, ...images], { type: 'image/x-icon' });
}

/** Caractéristiques visuelles d'une image, pour conseiller sur sa lisibilité. */
export interface ImageInsights {
  width: number;
  height: number;
  /** Part des pixels (quasi) transparents, de 0 à 1. */
  transparency: number;
  /** Luminance moyenne des pixels visibles, de 0 (noir) à 1 (blanc). */
  luminance: number;
}

/** Analyse une image sur une vignette réduite (128 px) : transparence et luminance moyenne. */
export async function analyzeImage(url: string): Promise<ImageInsights> {
  const img = await loadImage(url);
  const { naturalWidth: width, naturalHeight: height } = img;
  const scale = Math.min(1, 128 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let transparent = 0;
  let visible = 0;
  let lumSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 32) {
      transparent++;
      continue;
    }
    visible++;
    lumSum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  }
  const total = data.length / 4;
  return { width, height, transparency: transparent / total, luminance: visible ? lumSum / visible : 0 };
}
