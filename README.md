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
- **`Lead`** / **`ChatConversation`** — captured from the site.

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
    webgl/                    the topographic hero shader
    admin/                    CMS form primitives
  lib/
    content.ts   db.ts   ai.ts   auth.ts   session.ts
proxy.ts                      admin route gate (v16 renamed middleware.ts → proxy.ts)
```

## Design

Derived from the brand image in `brand/` — a brass compass set into a topographic basin relief:

- **Brass** `#c9a227` — primary accent, the compass and inlaid rails
- **Charcoal** `#08090b`–`#2f363f` — the marble ground
- **Parchment** `#f4ecdb` — contour-map substrate, body text
- **Verdigris** `#3f7d72` / **Ember** `#b87333` — oxidised copper accents

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
npm run db:seed     # re-seed content (idempotent)
npm run db:studio   # browse the database
npm run db:reset    # drop, re-migrate, re-seed
```

## Before deploying

- [ ] Set a real `SESSION_SECRET` (`openssl rand -base64 48`)
- [ ] Change `ADMIN_PASSWORD` and re-seed, or update the user in `/admin`
- [ ] Point `DATABASE_URL` at managed Postgres
- [ ] Add `AI_API_KEY`
- [ ] Replace the placeholder customer logos and hero statistics — they are illustrative
- [ ] Build out the pages the footer links to (currently `#` placeholders)
