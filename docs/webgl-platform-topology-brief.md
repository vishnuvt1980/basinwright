# Brief — WebGL "Platform Topology" section

Build an interactive WebGL centrepiece for the BasinWright homepage that demonstrates the core thesis: **one unified operating platform**, not a collection of vendors.

This document is the spec. Read it fully before writing code.

---

## 1. What it must show

A 3D stack of four layers, viewed at a slight isometric tilt, with data visibly moving **upward** through them:

| Layer | Content | Accent |
|---|---|---|
| 1 (base) | **GPU Compute** — clusters of accelerator nodes (H100 / H200 / B200), multi-node interconnect | `ember` |
| 2 | **Foundation Models** — model nodes from multiple providers (OpenAI, Anthropic, Meta, Mistral, Google, DeepSeek, Qwen, Cohere, open source) | `brass` |
| 3 | **Agents & Orchestration** — agent nodes (Procurement, Finance, HR, Legal, Supply Chain…) with planning/tool-calling links between them | `verdigris` |
| 4 (top) | **Enterprise Systems** — SAP, Salesforce, SharePoint, Microsoft 365, Oracle, databases | `slate` |

Particles/pulses travel base → top (a request being served) and top → base (data being grounded/retrieved). Layers are connected by visible filaments so the whole thing reads as **one system with one control plane** — that is the entire point of the visual.

### Interaction
- Slow idle auto-rotation; pointer parallax (ease toward cursor, never snap).
- Hovering a layer raises/highlights it, dims the others, and surfaces a label + one-line description.
- Clicking a layer pins that state; clicking again releases. Keep it a **read-only explanatory** interaction — no controls the user can get lost in.
- Respect `prefers-reduced-motion`: no auto-rotation, no pulses, static composed view.

Aim for "explanatory diagram rendered beautifully", not "abstract art". Someone should be able to screenshot a single frame and understand the product architecture.

---

## 2. Capability gating — the hard requirement

**Only mount the WebGL scene on genuinely capable machines.** Everywhere else, render the fallback silently — never a blank space, never a spinner, never a "your device is unsupported" message.

### Hard disqualifiers (any one → fallback)
- `prefers-reduced-motion: reduce`
- No WebGL2 context
- Viewport width < 1024px
- `navigator.connection.saveData === true`

### Capability score (needs to clear a threshold)
- `navigator.hardwareConcurrency` (treat ≤ 4 as weak)
- `navigator.deviceMemory` (treat ≤ 4 GB as weak; absent on Safari — don't let absence fail the check)
- GPU renderer string via the `WEBGL_debug_renderer_info` extension — **reject known software rasterisers** (`SwiftShader`, `llvmpipe`, `Microsoft Basic Render`, ANGLE software fallbacks)
- `MAX_TEXTURE_SIZE` / `MAX_RENDERBUFFER_SIZE` below a sane floor → weak

### Runtime guard (this matters more than the static score)
After mount, sample frame time for ~2 seconds. If sustained FPS is below ~40, **step quality down once** (lower DPR, fewer particles); if still below ~30, unmount the scene and fall back. Never let the page stutter to preserve the effect.

### Lifecycle
- Dynamic-import the scene so the three.js chunk is **not** in the homepage bundle.
- Mount lazily via `IntersectionObserver` only as the section approaches the viewport.
- Pause the render loop when the section is offscreen or `document.visibilityState === "hidden"`.
- Dispose geometries, materials, textures and the renderer on unmount — no GPU leaks on toggle.

---

## 3. Manual toggle — the second hard requirement

A visible control that lets the visitor turn graphics off (and back on).

- Persist the choice in `localStorage`; it **overrides auto-detection in both directions** — a user on a weak machine may force it on, a user on a workstation may force it off.
- The toggle must remain visible and operable **when graphics are off**, so the choice is reversible. Do not hide the only way back.
- Default state (no stored preference) = whatever auto-detection decides.
- Label it in plain language ("Immersive graphics: On / Off"), give it a real `aria-pressed` state, and make it keyboard-reachable.
- Turning it off must actually free the GPU context, not just hide the canvas with CSS.

Consider also honouring it site-wide for the existing hero shader (`src/components/webgl/hero-canvas.tsx`) so one switch governs all graphics — that is the behaviour a user expects.

---

## 4. Fallback (required, not optional)

When WebGL is off — by detection, by toggle, or by no-JS — the section must still communicate the four-layer architecture. Build a CSS/SVG stacked-layer diagram using the same content, tokens and copy. It should look deliberate, not degraded. Verify it by running with graphics toggled off and confirming the section still sells the idea.

---

## 5. Integration with the existing codebase

This project is a **CMS-driven site**. The new section must be content-managed like every other block — do not hardcode the copy.

### Steps
1. Add `PLATFORM_TOPOLOGY` to the `SectionKind` enum in `prisma/schema.prisma`, then `npx prisma migrate dev --name add-platform-topology`.
2. Seed a section in `prisma/seed.ts` at **order 4** (immediately after `why`), shifting `agents`, `models`, `products`, `industries`, `solutions`, `infrastructure`, `pricing`, `cta` down by one. Model the four layers as `Entry` rows — `title` = layer name, `body` = description, `accent` = the token from the table above, `bullets[]` = the node labels rendered in that layer. Re-run `npm run db:seed` (it is idempotent; it wipes and recreates sections).
3. Register the renderer in `src/components/sections/section-renderer.tsx` — the `RENDERERS` map is the single wiring point.
4. Build `src/components/sections/platform-topology.tsx` (the section shell, heading, fallback, toggle) and `src/components/webgl/platform-scene.tsx` (the R3F scene).

### Conventions to follow
- **Server components by default.** Only add `"use client"` where interaction demands it — see `platform-grid.tsx` (server) vs `why-pillars.tsx` (client) for the two patterns.
- Copy the capability-gate pattern from `src/components/webgl/hero-canvas.tsx`: it uses `useSyncExternalStore` with a cached snapshot and a `() => false` server snapshot. **Do not use `useState` + `useEffect`** — the ESLint config (`react-hooks/set-state-in-effect`) rejects it.
- Reuse existing primitives rather than inventing new ones:
  - `src/components/ui/primitives.tsx` — `SectionHeading`, `Eyebrow`, `Chip`, `ButtonLink`, `accent()`, `cn()`
  - `src/components/ui/reveal.tsx` — `Reveal`, `Stagger`, `StaggerItem`
  - `src/components/icon.tsx` — `Icon`, and add any new glyph to the explicit `REGISTRY` map (never import the full lucide barrel)
  - `src/lib/content.ts` — `SectionWithEntries`, `metaList()`
- Design tokens live in `src/app/globals.css` (`@theme`). Colours: `brass-*`, `basin-*`, `parchment-*`, `verdigris-*`, `ember-*`. Utilities: `container-bw`, `panel`, `topo`, `grain`, `rule-fade`, `text-brass-gradient`, `no-scrollbar`. **Use these — do not introduce raw hex values.**
- Shader source: see `src/components/webgl/basin-field.tsx` for the established GLSL style and uniform-handling approach.

### Next.js 16 gotchas (this is not Next 14/15)
- `cookies()`, `headers()`, `params`, `searchParams` are **async** — must be awaited.
- Middleware is `proxy.ts`, not `middleware.ts`.
- Turbopack is the default for `dev` and `build`. **Do not set `turbopack.root` in `next.config.ts`** — it corrupts the build manifest in this repo.
- `<Image priority>` is deprecated in favour of `preload`.
- Do not enable `cacheComponents`; the site relies on `export const dynamic` and `revalidatePath`.

---

## 6. Definition of done

- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint src proxy.ts` clean
- [ ] `npm run build` succeeds
- [ ] Section content is editable in `/admin` (log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`) and edits appear on the live page
- [ ] Verified with graphics **on**: scene renders, interaction works, no console errors
- [ ] Verified with graphics **off** via the toggle: fallback renders, GPU context released, toggle still reachable
- [ ] Verified with `prefers-reduced-motion`: no auto-rotation or pulses
- [ ] three.js chunk is absent from the initial homepage payload (check the build output / network tab)
- [ ] No layout shift when the scene mounts

### Verifying visually in this environment
Screenshots come back black or stale unless the Browser pane is fronted for each capture. The working loop:
1. Scroll with JS after setting `document.documentElement.style.scrollBehavior = 'auto'` (smooth scrolling depends on rAF, which is paused in a hidden tab).
2. Call `tabs_select` to front the tab.
3. Screenshot immediately.

Repeat the front-then-capture pair per frame. For correctness, prefer DOM assertions via `javascript_tool` (which works fine in a hidden tab) and `curl` of the SSR HTML over screenshots.

---

## 7. Running the project

```bash
docker start basinwright-postgres   # Postgres on port 5433
npm run dev                          # http://localhost:3000
```

`README.md` covers setup, the CMS data model, and the security notes.
