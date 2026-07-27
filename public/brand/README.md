# The BasinWright mark

Fluent UI System Icons' **Grid Dots**, with three of the nine dots lit.

```
· · ●   ← Intelligence   green   what you own
◐ · ·   ← Compute        blue    the platform you run on
· ● ·   ← Data           teal    what flows through it
```

## What it says

**The lattice is the estate.** Nine systems, raw and unresolved, always running.
The six unlit dots carry the substrate simulation's own `raw` hue, softened —
they are the ERPs, the historians, the document stores, present and untouched.

**The three lit dots are what we do to it,** and they are lit in the substrate's
own order: `context` (governed) → `verify` (proven) → `own` (yours). A legend
swatch in the console and a dot in the logo are the same colour saying the same
thing.

**Their positions are the argument.** Mid-left, bottom-centre, top-right traces
a check mark across the grid — the *Wright* in BasinWright, work signed off
rather than merely delivered. Three dots, for the three things the check is
drawn through, and for the three that reads as the B the name opens with.

The check is implied by the dots alone in the primary mark. `-check` draws it,
for slides and large formats where leaving the reading to the viewer is not
worth the risk.

## Files

| File | Use |
| --- | --- |
| `basinwright-mark.svg` | **Default.** Follows the viewer's light/dark preference. |
| `basinwright-mark-light.svg` | Fixed, for light surfaces. Use where CSS media queries do not reach — Office, Figma, print. |
| `basinwright-mark-dark.svg` | Fixed, for dark surfaces. |
| `basinwright-mark-check.svg` | The check drawn through the dots, in a gradient of the three hues. |
| `basinwright-mark-quad.svg` | Alternate: four corners lit — compute, data, model, intelligence — holding the lattice between them. |
| `basinwright-lockup-light.svg` | Mark plus wordmark, horizontal. |
| `basinwright-lockup-dark.svg` | The same, for dark surfaces. |

Served from this site, so other apps can point straight at them:
`https://basinwright.com/brand/basinwright-mark.svg`

## Palette

| Role | Light surface | Dark surface |
| --- | --- | --- |
| Lattice | `#aab2bf` | `#45506b` |
| Compute | `#0067b8` | `#6bb8f5` |
| Data | `#038387` | `#40e6c7` |
| Intelligence | `#107c10` | `#9ef259` |
| Model *(quad only)* | `#5c2e91` | `#8c99ff` |

These are duplicated as literal hex in every file here, as `--bw-mark-*` in
`src/app/globals.css`, and in `src/app/icon.svg`. **Change one, change all.**

## Using it

- **Clear space** — one dot-pitch (⅐ of the mark's width) on every side.
- **Minimum size** — 20px for the full mark. Below that use `src/app/icon.svg`,
  which drops the lattice back to texture so the three colours still read; nine
  dots of near-equal weight collapse into a grey smudge at 16px.
- **Do not** recolour the three lit dots, reorder them, light a fourth on the
  three-dot mark, or set the mark on a mid-tone that swallows the lattice.
- The wordmark lockups use live text in the Segoe UI Variable stack. Where the
  consumer may not have any of the fallbacks, use the mark on its own.

## Regenerating the raster icons

`src/app/icon.svg` is what modern browsers use, and it needs nothing. The two
formats that cannot be SVG — `favicon.ico` and `apple-icon.png` — are committed,
and are rebuilt from the SVGs above with:

```bash
node scripts/generate-brand-icons.mjs
```
