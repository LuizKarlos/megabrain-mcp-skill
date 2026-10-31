#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// ponytail: sRGB/WCAG 2.1 relative luminance; upgrade to APCA/WCAG 3 for perceptual lightness
export function parseColor(str) {
  // ponytail: validates RGB [0..255]; upgrade if color spaces beyond RGB are supported
  if (str && typeof str === 'object') {
    return [str.r, str.g, str.b].every((v) => Number.isInteger(v) && v >= 0 && v <= 255)
      ? { r: str.r, g: str.g, b: str.b }
      : null;
  }
  if (typeof str !== 'string') return null;
  let h = str.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function getLuminance(color) {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function getContrastRatio(fg, bg) {
  const l1 = getLuminance(fg), l2 = getLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function checkWcag(params = {}) {
  const fg = params.fg ?? params.foreground, bg = params.bg ?? params.background;
  const validColors = Boolean(parseColor(fg) && parseColor(bg));
  const ratio = validColors ? getContrastRatio(fg, bg) : 1;
  const passAA = validColors && ratio >= 4.5, passLarge = validColors && ratio >= 3.0;
  const parseDim = (v) => {
    if (v === undefined) return 44;
    if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : 0;
    if (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim())) return Number(v);
    return 0;
  };
  const width = parseDim(params.width), height = parseDim(params.height);
  const targetPass = width >= 44 && height >= 44;
  return {
    contrast: { ratio, passAA, passLarge },
    targetSize: { pass: targetPass, width, height },
    valid: Boolean(passAA && targetPass),
  };
}

export default checkWcag;

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`MegaBrain WCAG 2.1 Checker

Usage: node scripts/wcag_check.js --fg="#000" --bg="#fff" [--width=44] [--height=44] [--json]
Flags: --fg=<hex>, --bg=<hex>, --width=<px>, --height=<px>, --json, --help`);
    process.exit(0);
  }
  const getArg = (k) => {
    const eq = args.find((x) => x.startsWith(k + '='));
    if (eq) return eq.slice(k.length + 1).replace(/^["']|["']$/g, '');
    const idx = args.indexOf(k);
    return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('-') ? args[idx + 1].replace(/^["']|["']$/g, '') : undefined;
  };
  const file = args.find((a) => !a.startsWith('-'));
  const params = file
    ? JSON.parse(readFileSync(file, 'utf8'))
    : {
        fg: getArg('--fg') ?? '#000000', bg: getArg('--bg') ?? '#ffffff',
        width: getArg('--width') ? Number(getArg('--width')) : 44, height: getArg('--height') ? Number(getArg('--height')) : 44,
      };
  if (file && (params === null || typeof params !== 'object' || Array.isArray(params))) {
    throw new TypeError('WCAG file must be a JSON object');
  }
  const res = checkWcag(params);
  if (args.includes('--json')) console.log(JSON.stringify(res, null, 2));
  else console.log(`WCAG 2.1 Audit: ${res.valid ? 'PASSED' : 'FAILED'}
  Contrast: ${res.contrast.ratio}:1 (AA: ${res.contrast.passAA ? 'PASS' : 'FAIL'}, Large: ${res.contrast.passLarge ? 'PASS' : 'FAIL'})
  Target Size: ${res.targetSize.width}x${res.targetSize.height}px (${res.targetSize.pass ? 'PASS' : 'FAIL'})`);
  if (!res.valid) process.exitCode = 1;
}
