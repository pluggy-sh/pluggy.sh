#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const LOGO = join(ROOT, "src", "assets", "logo-light.svg");
const OUT_DIR = join(ROOT, "public");
const OUT = join(OUT_DIR, "og.png");

const W = 1200;
const H = 630;
const BG = "#0b0b0f";
const ACCENT = "#a78bfa";

const logoSvg = await readFile(LOGO, "utf8");
const logoBuf = await sharp(Buffer.from(logoSvg))
  .resize({ width: 720 })
  .png()
  .toBuffer();
const logoMeta = await sharp(logoBuf).metadata();
const logoH = logoMeta.height ?? 192;

const tagline = "A single-binary CLI for Minecraft plugin development";
const url = "pluggy.sh";

const overlay = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0f"/>
      <stop offset="100%" stop-color="#1a1530"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="220" fill="${ACCENT}" opacity="0.12"/>
  <circle cx="120" cy="540" r="180" fill="${ACCENT}" opacity="0.10"/>
  <text x="80" y="${H - 180}" font-family="-apple-system, Inter, system-ui, sans-serif" font-size="40" font-weight="500" fill="#e5e7eb">${tagline}</text>
  <text x="80" y="${H - 80}" font-family="-apple-system, Inter, system-ui, sans-serif" font-size="32" font-weight="600" fill="${ACCENT}">${url}</text>
</svg>`;

const bgBuf = await sharp(Buffer.from(overlay)).png().toBuffer();

const composed = await sharp(bgBuf)
  .composite([
    {
      input: logoBuf,
      left: 80,
      top: Math.round((H - logoH) / 2 - 80),
    },
  ])
  .png()
  .toBuffer();

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, composed);
console.log(`Wrote ${OUT} (${W}x${H})`);

// apple-touch-icon: iOS doesn't support SVG favicons, and transparent PNGs
// look bad on the home screen. Render the brand glyph on the brand background.
const APPLE_SIZE = 180;
const APPLE_OUT = join(OUT_DIR, "apple-touch-icon.png");
const FAVICON_SVG = join(OUT_DIR, "favicon.svg");
const faviconRaw = await readFile(FAVICON_SVG, "utf8");
// Force the white-glyph variant — the adaptive media query doesn't apply
// when the SVG is rasterized headlessly by sharp.
const glyphSvg = faviconRaw
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/<path /, '<path fill="#ffffff" ');
const glyphBuf = await sharp(Buffer.from(glyphSvg))
  .resize({ width: Math.round(APPLE_SIZE * 0.7) })
  .png()
  .toBuffer();
const glyphMeta = await sharp(glyphBuf).metadata();
const glyphW = glyphMeta.width ?? 0;
const glyphH = glyphMeta.height ?? 0;
const apple = await sharp({
  create: {
    width: APPLE_SIZE,
    height: APPLE_SIZE,
    channels: 4,
    background: BG,
  },
})
  .composite([
    {
      input: glyphBuf,
      left: Math.round((APPLE_SIZE - glyphW) / 2),
      top: Math.round((APPLE_SIZE - glyphH) / 2),
    },
  ])
  .png()
  .toBuffer();
await writeFile(APPLE_OUT, apple);
console.log(`Wrote ${APPLE_OUT} (${APPLE_SIZE}x${APPLE_SIZE})`);
