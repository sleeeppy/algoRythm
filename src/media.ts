const NAME = /^\d{8}-[a-f0-9]{8}\.(jpg|png|gif|webp)$/;

export function isMediaName(name: string) {
  return NAME.test(name);
}

export function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(file.name);
}

function mediaName(ext: string) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const id = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${stamp}-${id}.${ext}`;
}

function blobOf(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("사진을 준비하지 못했습니다."))), type, 0.86);
  });
}

export async function prepareImage(file: File) {
  if (!isImageFile(file)) throw new Error("사진만 넣을 수 있습니다.");
  if (file.size > 25 * 1024 * 1024) throw new Error("사진이 너무 큽니다.");
  if (file.type === "image/gif" || /\.gif$/i.test(file.name)) {
    if (file.size > 8_000_000) throw new Error("사진이 너무 큽니다.");
    return { name: mediaName("gif"), blob: file };
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("이 사진은 넣을 수 없습니다.");
  try {
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("사진을 준비하지 못했습니다.");
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    let transparent = false;
    for (let index = 3; index < pixels.length; index += 16) {
      if (pixels[index] !== 255) {
        transparent = true;
        break;
      }
    }
    const png = file.type === "image/png" || /\.png$/i.test(file.name);
    const keepPng = png && (transparent || file.size < 1_500_000);
    if (!keepPng) {
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    const blob = await blobOf(canvas, keepPng ? "image/png" : "image/jpeg");
    if (blob.size > 8_000_000) throw new Error("사진이 너무 큽니다.");
    return { name: mediaName(keepPng ? "png" : "jpg"), blob };
  } finally {
    bitmap.close();
  }
}

export function insertBlock(body: string, index: number, block: string) {
  const at = Math.max(0, Math.min(index, body.length));
  const before = body.slice(0, at);
  const after = body.slice(at);
  const lead = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trail = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const next = `${before}${lead}${block}${trail}${after}`;
  return { next, cursor: before.length + lead.length + block.length + trail.length };
}

export function indexAtPoint(textarea: HTMLTextAreaElement, clientX: number, clientY: number) {
  const text = textarea.value;
  if (!text) return 0;
  const style = getComputedStyle(textarea);
  const rect = textarea.getBoundingClientRect();
  const padLeft = parseFloat(style.paddingLeft) || 0;
  const padRight = parseFloat(style.paddingRight) || 0;
  const padTop = parseFloat(style.paddingTop) || 0;
  const x = clientX - rect.left - (parseFloat(style.borderLeftWidth) || 0) - padLeft + textarea.scrollLeft;
  const y = clientY - rect.top - (parseFloat(style.borderTopWidth) || 0) - padTop + textarea.scrollTop;

  const mirror = document.createElement("div");
  mirror.style.position = "fixed";
  mirror.style.left = "0";
  mirror.style.top = "0";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = style.overflowWrap;
  mirror.style.wordBreak = style.wordBreak;
  mirror.style.lineBreak = style.lineBreak;
  mirror.style.width = `${Math.max(0, textarea.clientWidth - padLeft - padRight)}px`;
  mirror.style.font = style.font;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.tabSize = style.tabSize;
  mirror.style.fontVariantLigatures = style.fontVariantLigatures;
  mirror.style.fontFeatureSettings = style.fontFeatureSettings;
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  document.body.append(mirror);

  const place = (offset: number) => {
    mirror.replaceChildren(document.createTextNode(text.slice(0, offset)), marker);
    const host = mirror.getBoundingClientRect();
    const caret = marker.getBoundingClientRect();
    return { left: caret.left - host.left, top: caret.top - host.top, height: caret.height || parseFloat(style.lineHeight) || 20 };
  };

  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    const pos = place(mid);
    const earlier = pos.top + pos.height <= y;
    const sameLine = pos.top <= y && y < pos.top + pos.height;
    if (earlier || (sameLine && pos.left <= x)) low = mid + 1;
    else high = mid;
  }
  mirror.remove();
  return low;
}

async function encode(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const size = 0x8000;
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size));
  }
  return btoa(binary);
}

export async function uploadImage(name: string, blob: Blob, key: string) {
  if (!isMediaName(name)) throw new Error("사진을 올리지 못했습니다.");
  const response = await fetch("/api/media", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, name, data: await encode(blob) }),
  });
  const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; src?: string } | null;
  if (!response.ok || !result?.ok || !result.src) throw new Error(result?.error || "사진을 올리지 못했습니다.");
  return result.src;
}
