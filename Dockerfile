# syntax=docker/dockerfile:1.7
#
# Four stages: install once, build once, and ship a runner that carries the
# traced server plus exactly the extra node_modules the startup command needs
# (prisma to run the migrations, tsx to run the TypeScript seed). Everything
# else the app reaches for at runtime is already inside `.next/standalone`.

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
# The schema has to be present before install: `postinstall` runs
# `prisma generate`, which reads it.
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` traces the server but not these two — see next.config.ts.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# The query engine is the one thing tracing reliably misses — it is resolved at
# runtime, not imported. Everything else this image runs is already inside
# `.next/standalone`.
#
# The Prisma *CLI* deliberately does not ship here. It pulls a transitive tree
# of its own (@prisma/config -> effect -> …) that cannot be cherry-picked
# without breaking on the next upgrade, and a slim runtime is the whole point
# of the standalone build. Migrations and the seed run from the `builder` stage
# instead, as their own short-lived containers — see docker-compose.yml.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
