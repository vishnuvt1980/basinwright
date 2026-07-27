// Rasterises the mark into the two formats that cannot be SVG.
//
// Modern browsers take src/app/icon.svg and are done — it is theme-aware and
// resolution-independent, which no raster can be. Two consumers still refuse it:
//
//   favicon.ico   — older browsers, and Windows shortcuts / jump lists.
//   apple-icon    — iOS home-screen bookmarks, which want an opaque square and
//                   apply their own corner radius over it.
//
// Both are committed to the repo, so this only needs re-running when the mark
// changes. The dark-surface variant is used for the Apple icon because that
// tile is drawn on our own canvas colour rather than on the browser's chrome.
//
// Run with: node scripts/generate-brand-icons.mjs

import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const LIGHT = "public/brand/basinwright-mark-light.svg";
const DARK = "public/brand/basinwright-mark-dark.svg";

const ICO_OUT = "src/app/favicon.ico";
const APPLE_OUT = "src/app/apple-icon.png";

/// The site's dark canvas. iOS composites the tile on whatever we give it, and
/// a transparent one comes out black on some launchers.
const CANVAS = { r: 0x0e, g: 0x17, b: 0x26, alpha: 1 };

/// The mark's own bounds inside Fluent's 24px box, plus a hair of margin —
/// matching src/app/icon.svg, so the favicon and the .ico agree.
const CROP = 'viewBox="1.5 1.5 21 21"';

/// Sizes a .ico is expected to carry. 48 is what Windows uses at large icon
/// sizes; 16 and 32 are the tab and the bookmark bar.
const ICO_SIZES = [16, 32, 48];

/* -------------------------------------------------------------------------- */

/// Re-weights the mark the way icon.svg does. At 16px the gap between Fluent's
/// regular and filled radii is under a pixel, so nine dots of near-equal weight
/// collapse into a grey smudge; the lattice has to drop back to texture and let
/// the three lit dots carry the tile.
function forSmallSizes(svg) {
  return svg
    .replace('viewBox="0 0 24 24"', CROP)
    .replace('fill="#aab2bf"', 'fill="#ccd3dd"')
    .replaceAll('r="1.5"', 'r="1.15"')
    .replaceAll('r="2"', 'r="2.9"');
}

async function png(svg, size, background) {
  let pipeline = sharp(Buffer.from(svg), { density: 384 }).resize(size, size, {
    fit: "contain",
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (background) pipeline = pipeline.flatten({ background });
  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Wraps PNGs in an ICO container.
 *
 * The format is a 6-byte directory header, one 16-byte entry per image, then
 * the payloads. Storing PNGs rather than BMPs is legal since Vista and is what
 * every generator emits now; it also avoids hand-rolling a bottom-up BMP with a
 * padded AND mask.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    // 0 means 256 in this field; none of our sizes reach it, but be explicit.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colours — none, it is a PNG
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

/* -------------------------------------------------------------------------- */

const light = forSmallSizes(readFileSync(LIGHT, "utf8"));
const dark = readFileSync(DARK, "utf8");

const images = [];
for (const size of ICO_SIZES) {
  images.push({ size, data: await png(light, size) });
}
writeFileSync(ICO_OUT, ico(images));
console.log(`${ICO_OUT} — ${ICO_SIZES.join(", ")}px`);

// The Apple tile is a filled square: the mark sits at 62% of it, which is the
// proportion iOS's own icons use inside their safe area.
const APPLE = 180;
const inner = Math.round(APPLE * 0.62);
const pad = Math.round((APPLE - inner) / 2);

const tile = await sharp({
  create: { width: APPLE, height: APPLE, channels: 4, background: CANVAS },
})
  .composite([{ input: await png(dark, inner), top: pad, left: pad }])
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(APPLE_OUT, tile);
console.log(`${APPLE_OUT} — ${APPLE}px on ${"#0e1726"}`);
