import sharp from "sharp";

const parseHex = (value = "#FF00FF") => {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  if (!match) throw new Error(`Invalid chroma color ${value}`);
  return match.slice(1).map((part) => Number.parseInt(part, 16));
};

export async function processAsset(input, options) {
  const targetWidth = Number(options.width) * Number(options.tileSize || 16);
  const targetHeight = Number(options.height) * Number(options.tileSize || 16);
  if (!(targetWidth > 0) || !(targetHeight > 0)) throw new Error("Target dimensions must be positive");
  const chroma = parseHex(options.chromaColor || "#FF00FF");
  const tolerance = Number(options.chromaTolerance ?? 32);
  const alphaThreshold = Number(options.alphaThreshold ?? 128);

  const source = sharp(input, { failOn: "error" }).ensureAlpha();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  let visible = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const distance = Math.sqrt(
      (data[offset] - chroma[0]) ** 2 +
      (data[offset + 1] - chroma[1]) ** 2 +
      (data[offset + 2] - chroma[2]) ** 2,
    );
    if (distance <= tolerance) data[offset + 3] = 0;
    else {
      data[offset + 3] = data[offset + 3] >= alphaThreshold ? 255 : 0;
      if (data[offset + 3] > 0) visible++;
    }
  }
  if (visible === 0) throw new Error("Image contains no visible pixels after chroma removal");

  const foreground = sharp(data, { raw: info }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const trimmed = await foreground.png().toBuffer();
  const metadata = await sharp(trimmed).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Image contains no visible pixels after trimming");

  const scale = Math.min(targetWidth / metadata.width, targetHeight / metadata.height);
  const width = Math.max(1, Math.round(metadata.width * scale));
  const height = Math.max(1, Math.round(metadata.height * scale));
  const resized = await sharp(trimmed).resize(width, height, { kernel: "nearest", fit: "fill" }).png().toBuffer();
  const left = Math.floor((targetWidth - width) / 2);
  const top = options.anchor === "center" ? Math.floor((targetHeight - height) / 2) : targetHeight - height;

  return sharp({
    create: { width: targetWidth, height: targetHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: resized, left, top }]).png({
    palette: true,
    colours: Math.max(2, Math.min(256, Number(options.maxColors || 64))),
    dither: 0,
  }).toBuffer();
}

const xmlEscape = (value) => String(value).replace(/[<>&"']/g, (character) => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;",
}[character]));

export async function createContactSheet(items, options = {}) {
  const columns = Math.max(1, Number(options.columns || 4));
  const cellWidth = Number(options.cellWidth || 160);
  const cellHeight = Number(options.cellHeight || 160);
  const rows = Math.max(1, Math.ceil(items.length / columns));
  const composites = [];

  for (const [index, item] of items.entries()) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const preview = await sharp(item.input).resize(cellWidth - 24, cellHeight - 44, {
      fit: "inside", kernel: "nearest", withoutEnlargement: false,
    }).png().toBuffer();
    const metadata = await sharp(preview).metadata();
    composites.push({
      input: preview,
      left: column * cellWidth + Math.floor((cellWidth - metadata.width) / 2),
      top: row * cellHeight + 8 + Math.floor((cellHeight - 44 - metadata.height) / 2),
    });
    const label = Buffer.from(`<svg width="${cellWidth}" height="28"><rect width="100%" height="100%" fill="#20242b"/><text x="${cellWidth / 2}" y="19" text-anchor="middle" font-family="sans-serif" font-size="12" fill="white">${xmlEscape(item.label)}</text></svg>`);
    composites.push({ input: label, left: column * cellWidth, top: row * cellHeight + cellHeight - 28 });
  }

  return sharp({
    create: { width: columns * cellWidth, height: rows * cellHeight, channels: 4, background: { r: 225, g: 225, b: 225, alpha: 1 } },
  }).composite(composites).png().toBuffer();
}
