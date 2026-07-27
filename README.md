# BasinWright

Marketing site and CMS for BasinWright — positioned as an **Enterprise AI Operating Platform** (Enterprise Intelligence as a Service), not another Models-as-a-Service vendor.

Every block on the homepage is content-managed. Nothing is hardcoded: the hero, the product ecosystem, pricing tiers, industries, navigation and the chat assistant's persona all come out of Postgres and are editable at `/admin`.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Database | PostgreSQL 16 + Prisma 6 |
| Motion | Motion (Framer Motion) — scrollytelling & micro-interactions |
| WebGL | react-three-fiber + three.js — animated topographic hero |
| Auth | JWT session cookie (`jose`) + bcrypt password hashing |
| AI | Any OpenAI-compatible endpoint — defaults to Together AI |

## Getting started

**1. Start Postgres.** The dev database runs in Docker on port **5433** (5432 is often already taken):

```bash
docker run -d --name basinwright-postgres -e POSTGRES_USER=basinwright -e POSTGRES_PASSWORD=basinwright_dev -e POSTGRES_DB=basinwright -p 5433:5432 -v basinwright-pgdata:/var/lib/postgresql/data postgres:16-alpine
```

**2. Configure the environment:**

```bash
cp .env.example .env
```

**3. Install, migrate, seed:**

```bash
npm install && npx prisma migrate dev && npm run db:seed
```

**4. Run it:**

```bash
npm run dev
```

Site at `http://localhost:3000`, CMS at `http://localhost:3000/admin`.

Default credentials come from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — seeded as `admin@basinwright.com` / `basinwright`. **Change these before deploying.**

## Configuring the AI assistant

The chat widget talks to any OpenAI-compatible `/chat/completions` endpoint. Set three variables in `.env`:

```bash
AI_API_KEY="your-together-api-key"
AI_BASE_URL="https://api.together.xyz/v1"
AI_MODEL="meta-llama/Llama-3.3-70B-Instruct-Turbo"
```

Swapping providers is a URL change — OpenAI, Groq, Fireworks, vLLM or an internal gateway all work unchanged.

Without a key the widget stays visible and returns a clear "not configured" message rather than failing silently.

The assistant's system prompt is **generated from live CMS content on every request**, so it can only describe what the site actually says — edit a section and its answers change with it. Conversations are logged to `/admin/chats`, which is a useful signal for content gaps.

## How the CMS is modelled

Rather than a table per block type, the homepage is modelled generically so one editing UI covers everything:

- **`Section`** — one per block on the page. `kind` (an enum) selects the React component that renders it; `order` and `visible` control page composition.
- **`Entry`** — the repeated items inside a section: capability cards, agents, product tiers, pricing plans, logos. Carries `title`, `body`, `icon`, `bullets[]`, `accent`, and so on.
- **`SiteSetting`** — global strings, grouped and typed for form rendering.
- **`NavItem`** — header links and footer columns.
- **`Lead`** / **`ChatConversation`** — captured from the site. A `Lead` also carries the substrate console configuration the visitor built, if they built one — see below.

Adding a new block type means adding a value to the `SectionKind` enum and one line in `src/components/sections/section-renderer.tsx`.

```
src/
  app/
    page.tsx                  homepage — server-rendered from Postgres
    api/chat/route.ts         SSE streaming chat endpoint
    admin/
      (auth)/login/           unauthenticated sign-in
      (shell)/                authenticated CMS: sections, settings, nav, leads, chats
      actions.ts              content mutations
      auth-actions.ts         login / logout
  components/
    sections/                 one component per SectionKind
    webgl/                    hero shader, platform topology, cognitive substrate
    admin/                    CMS form primitives
  lib/
    content.ts   db.ts   ai.ts   auth.ts   session.ts
    industries.ts             the industry catalogue the console is tailored from
    demo-config.ts            the visitor's console configuration: types, validation, summaries
    demo-config-store.ts      the same, as a client-side external store over localStorage
proxy.ts                      admin route gate (v16 renamed middleware.ts → proxy.ts)
```

## The substrate console

The hero banner runs a live simulation of the product. **Open the full console** on it
asks the visitor what to build first — industry, line of business, their own systems,
the decisions they want it working, their scale and data residency, and what is hurting
right now — and then runs the whole simulation on *their* answers: their systems feed
the ingest side, their decisions cross the board, the agent council is named for their
sector, and the last node carries their own company name.

| Where | What |
| --- | --- |
| `lib/industries.ts` | Every industry, its systems, its decisions, its agents. The only file to touch when adding a sector. |
| `webgl/substrate/configure.ts` | Turns a `DemoConfig` into a running board. Call before an engine is built, never while one is stepping. |
| `webgl/substrate/topology.ts` | `setSources` rewrites the ingest side in place — the lattice and the field hold references into it. |
| `webgl/substrate-configurator.tsx` | The questions. |

The answers are kept in `localStorage`, so a returning visitor goes straight to their own
console and the hero banner adopts their world too. They are sent nowhere unless the
visitor later submits the contact form, where the configuration is shown to them, is
theirs to detach, and — if they leave it attached — arrives in `/admin/leads` under
their enquiry.

## Design

Derived from the brand image in `brand/` — a brass compass set into a topographic basin relief:

- **Brass** `#c9a227` — primary accent, the compass and inlaid rails
- **Charcoal** `#08090b`–`#2f363f` — the marble ground
- **Parchment** `#fbf7ef` — contour-map substrate, the light theme's canvas
- **Verdigris** `#3f7d72` / **Ember** `#b87333` — oxidised copper accents

### The mark

Fluent UI System Icons' **Grid Dots**, with three of the nine dots lit — compute
(blue), data (teal), intelligence (green). The lattice is the estate: raw,
unresolved, always running. The three lit dots are what we do to it, coloured in
the substrate console's own order — governed → proven → yours — and positioned so
they trace a check mark across the grid: the *Wright* in BasinWright.

Assets, palette, usage rules and the four-dot alternate live in
[`public/brand/README.md`](public/brand/README.md), served from
`/brand/` so other apps can point straight at them. `favicon.ico` and
`apple-icon.png` are rebuilt from those SVGs with
`node scripts/generate-brand-icons.mjs`; everything else is `src/app/icon.svg`,
which is theme-aware and needs no raster.

### Theming

The site ships **light and dark themes** off one set of semantic tokens defined in
`src/app/globals.css`. Components reference the semantic names, never the raw
palette, so both themes stay in sync by construction:

| Token | Use |
|---|---|
| `canvas` | page background |
| `surface` / `raised` | cards, panels, hover states |
| `line` / `line-strong` | hairlines, borders, control outlines |
| `ink` / `ink-2` / `ink-3` | primary, secondary, tertiary text |
| `accent` / `accent-strong` / `on-accent` | brass, and text that sits on it |

So `bg-surface text-ink border-line` is correct in both themes; `bg-basin-900
text-parchment-50` is not, and will be unreadable in light mode.

Theme resolution: an inline script in `<head>` (`src/components/theme/theme-script.tsx`)
stamps `data-theme` on `<html>` before first paint, so there is no flash. The
`<ThemeToggle>` offers Light / System / Dark, persists to `localStorage`, and
follows the OS while set to System. A `prefers-color-scheme` fallback in CSS covers
the no-JS case. The WebGL hero observes `data-theme` and re-tints its contour
shader, since brass tuned for charcoal washes out on parchment.

All token pairs meet **WCAG AA** (4.5:1 for text, 3:1 for icon glyphs) in both themes.

### Icons

Icons are [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons)
(MIT). `scripts/generate-icons.mjs` extracts just the glyphs the site uses from
`@fluentui/svg-icons` into `src/components/fluent-icons.generated.ts` — raw path
data, no runtime.

We deliberately do **not** use `@fluentui/react-icons`: those components are built
on Griffel (runtime CSS-in-JS) and React hooks, which would force a client boundary
on every server-rendered section that shows an icon and ship a second styling
runtime alongside Tailwind.

To add an icon, add it to the map in `scripts/generate-icons.mjs` and run:

```bash
npm run icons:generate
```

Fluent's glyphs are monochrome, so colour comes from a **tone system**. Each icon
sits in a tinted tile whose tint, ring and glyph colour derive from one hue:

```tsx
<IconTile name="Cpu" />                        {/* stable tone hashed from the name */}
<IconTile name="Cpu" tone="azure" size="lg" /> {/* explicit */}
<IconTile name={e.icon} tone={toneForAccent(e.accent, e.title)} />
```

Tones are hashed from the icon name, so a concept keeps the same colour everywhere
it appears and reordering a section never reshuffles the palette. Each of the eight
tones has a light and a dark value; the tile derives everything else with
`color-mix`.

### Typography

Body and UI text use the **Segoe UI** stack, matching microsoft.com. Segoe is
licensed with Windows and **cannot be self-hosted**, so the stack uses it where it
already exists and falls back to each platform's native UI face:

```
"Segoe UI Variable Text", "Segoe UI Variable", "Segoe UI", system-ui,
-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif
```

Only the display face (Instrument Serif, used for headings) is webfont-served, via
`next/font`. If you ever need Segoe's exact metrics on every platform, vendor
[Selawik](https://github.com/microsoft/Selawik) — Microsoft's OFL-licensed,
metrically-compatible substitute.

Motion is deliberate rather than decorative: the hero runs a GLSL contour-field shader that drifts toward the cursor, "Why BasinWright" is a scroll-driven narrative rail, and the product ecosystem stacks as pinned cards so the ecosystem reads as one descent rather than a grid.

Accessibility and resilience are handled rather than assumed — `prefers-reduced-motion` is respected throughout, the WebGL layer is skipped on reduced-motion, small screens and low-core devices (the CSS contour backdrop is a complete fallback), and a `<noscript>` rule guarantees content is visible if JavaScript never runs.

## Security notes

- Passwords are bcrypt-hashed (cost 12). Credential checks compare against a dummy hash when the user is missing, so timing doesn't reveal which emails exist.
- Sessions are `httpOnly`, `sameSite=lax`, `secure` in production, signed with `SESSION_SECRET`.
- `proxy.ts` gates `/admin`, but **every Server Action and admin page re-verifies the session independently** — Server Actions POST to the page route and are reachable directly, so proxy matching alone is not authorization.
- The `?next=` redirect parameter is restricted to `/admin` paths so it can't become an open redirect.
- The chat endpoint is rate-limited per IP (12 req/min, in-memory — move to Redis if you run multiple replicas) and validates all input with Zod.
- The lead form has a honeypot field.

`npm audit` reports advisories in the ESLint and PostCSS toolchains. These are **build-time dev dependencies only**, with no runtime exposure; clearing them requires a breaking ESLint major.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run db:seed     # reset content to the seed — replaces sections/entries/nav
npm run db:studio   # browse the database
npm run db:reset    # drop, re-migrate, re-seed
```

## Deployment

Production runs on the Vultr box at `192.248.150.151`, in Docker, behind the
Caddy already on that host. It shares the box with wersel.ai, so every port is
shifted and bound to loopback: **wersel.ai holds 3000/5433, basinwright.com
holds 3001/5434**, and Caddy is the only thing that reaches either.

```
/datadrive/basinwright        the deploy checkout (git remote: origin/main)
  .env                        server-only secrets, never committed
  docker-compose.yml          db + web + a one-off seed service
  docker-compose.override.yml binds both published ports to 127.0.0.1
/etc/caddy/Caddyfile          TLS + reverse proxy for both sites
```

`output: "standalone"` in `next.config.ts` is what makes the runner image
small — see the `Dockerfile` for the two directories tracing leaves behind.

### Deploying a change

```bash
ssh linuxuser@192.248.150.151
cd /datadrive/basinwright && git pull
docker compose up -d --build
```

The web container runs `prisma migrate deploy` before `server.js`, so a commit
that adds a migration needs nothing extra.

### The seed is destructive — do not wire it into startup

`prisma/seed.ts` replaces sections, entries and navigation **wholesale**. It is
deliberately not part of the container's start command: running it on each
deploy would throw away everything edited in `/admin` since the last one. Leads
and chat transcripts are never touched, and the admin user is upserted rather
than replaced. Run it only when you mean to reset the CMS to the seed content:

```bash
docker compose --profile tools run --rm seed
```

### Still to do

- [ ] Replace the placeholder customer logos and hero statistics — they are illustrative
- [ ] Build out the pages the footer links to (currently `#` placeholders)
