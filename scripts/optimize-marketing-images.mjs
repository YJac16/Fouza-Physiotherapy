#!/usr/bin/env node
/**
 * Resize/compress clinic photos in public/ for web delivery.
 * Scales down only (no crop), converts photo PNGs to JPEG.
 */
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const MAX_EDGE = 1920;
const JPEG_QUALITY = 80;
const TARGET_BYTES = 350_000;
const FALLBACK_EDGE = 1600;
const FALLBACK_QUALITY = 72;

const PHOTO_PNGS = new Set(["dry-needling.png"]);

const SKIP = new Set([
  "apple-touch-icon.png",
  "favicon-32x32.png",
  "fouza-physiotherapy-logo-no-background.png",
  "fouza-physiotherapy-logo.png",
  "fouza-physiotherapy-logo-vector-no-background.png",
  "fouza-physiotherapy-logo-wordmark-dark.png",
  "fouza-physiotherapy-logo-wordmark.png",
  "hpcsa-logo.png",
  "icon-192.png",
  "icon-512.png",
]);

function isPhoto(name) {
  const lower = name.toLowerCase();
  if (SKIP.has(name)) return false;
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return true;
  return PHOTO_PNGS.has(name);
}

async function optimizeFile(name) {
  const inputPath = path.join(publicDir, name);
  const convertToJpeg = PHOTO_PNGS.has(name);
  const outputPath = convertToJpeg
    ? path.join(publicDir, name.replace(/\.png$/i, ".jpg"))
    : inputPath;

  const meta = await sharp(inputPath).metadata();

  async function encode(maxEdge, quality) {
    return sharp(inputPath)
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();
  }

  let buffer = await encode(MAX_EDGE, JPEG_QUALITY);
  if (buffer.length > TARGET_BYTES) {
    buffer = await encode(FALLBACK_EDGE, FALLBACK_QUALITY);
  }

  await sharp(buffer).toFile(outputPath);
  if (convertToJpeg && outputPath !== inputPath) {
    await unlink(inputPath);
  }

  const outMeta = await sharp(outputPath).metadata();
  const kb = Math.round(buffer.length / 1024);
  console.log(
    `${name} ${meta.width}x${meta.height} → ${path.basename(outputPath)} ${outMeta.width}x${outMeta.height} ${kb}KB`,
  );
  return { name: path.basename(outputPath), bytes: buffer.length };
}

const files = (await readdir(publicDir)).filter(isPhoto).sort();
const results = [];
for (const name of files) {
  results.push(await optimizeFile(name));
}

const over = results.filter((r) => r.bytes > 350_000);
if (over.length) {
  console.warn(
    "Warning: still over 350KB:",
    over.map((r) => `${r.name} ${Math.round(r.bytes / 1024)}KB`).join(", "),
  );
}
