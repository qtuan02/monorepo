ARG BUN_VERSION=1.4.0
ARG NODE_VERSION=24
ARG APP_DIRNAME=portfolio
ARG PROJECT=@monorepo/portfolio
ARG NODE_ENV=production

# Step 1: Base Layer
FROM oven/bun:${BUN_VERSION}-alpine AS base
RUN apk update && apk add --no-cache libc6-compat

# Step 2: Pruner Layer — the workspace, cut down to this app and its deps.
FROM base AS pruner
ARG PROJECT
WORKDIR /app
COPY . .
RUN bunx turbo prune ${PROJECT} --docker

# Step 3: Builder Layer
FROM base AS builder
ARG APP_DIRNAME
ARG PROJECT
ARG NODE_ENV

# Build-per-env: names which `.env.<BUILD_ENV>` file in the build context holds
# this image's NEXT_PUBLIC_* values. The default is the committed example so a
# bare `docker build` still produces a working image; a real deploy passes
# `--build-arg BUILD_ENV=production`.
ARG BUILD_ENV=example

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/bunfig.toml ./bunfig.toml

RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# The target environment's file becomes the root `.env` every later step reads —
# the app's own `build` script loads it with `dotenv -e ../../.env --`, because
# `next build` only reads a `.env` sitting inside the app directory.
COPY .env.${BUILD_ENV} .env

# After `bun install`, so that step still sees the devDependencies the build needs.
ENV NODE_ENV=${NODE_ENV}

# Validate against the same module the app parses at runtime, so a missing or
# malformed variable fails the image build here — named — instead of shipping a
# server that only breaks on its first request. Importing `src/env.ts` itself is
# what guarantees the check and the app can never drift apart. Bun only
# auto-loads a `.env` in its cwd, so the root one is named explicitly.
RUN cd apps/${APP_DIRNAME} && bun --env-file=/app/.env -e "import './src/env.ts';"

RUN bun run build --filter=${PROJECT}

# Step 4: Runner Layer — Node, not Bun and not nginx. `output: "standalone"`
# emits a plain Node server plus only the files it traced, so the runtime image
# carries no package manager and no workspace install.
FROM node:${NODE_VERSION}-alpine AS runner
ARG APP_DIRNAME

ENV NODE_ENV=production
# `server.js` binds these; a container that binds 127.0.0.1 is unreachable from
# outside itself. This 3000 is the port INSIDE the container, deliberately
# independent of `ports.env`: a container has its own network namespace, so it
# cannot collide with a dev or E2E server, and `gen:app` does not rewrite it.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# `standalone` mirrors the workspace layout below `outputFileTracingRoot`, so it
# unpacks to /app/apps/<app>/server.js plus a hoisted /app/node_modules. The two
# folders Next deliberately leaves out — it assumes a CDN serves them — are
# copied back in beside it, which is what makes `server.js` serve them itself.
COPY --from=builder --chown=node:node /app/apps/${APP_DIRNAME}/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/${APP_DIRNAME}/.next/static ./apps/${APP_DIRNAME}/.next/static
COPY --from=builder --chown=node:node /app/apps/${APP_DIRNAME}/public ./apps/${APP_DIRNAME}/public

# The environment file the builder was given, beside `server.js`. Next's
# standalone server calls `loadEnvConfig` on its own cwd at boot, so this is
# what makes a **server-only** variable exist at runtime: every `NEXT_PUBLIC_*`
# was inlined at build time, but an unprefixed secret stays in `process.env`
# and is in no bundle. Without it `apps/mcp-weather` boots straight into
# `Invalid environment: MCP_WEATHER_OPENWEATHERMAP_API_KEY` and answers 500 to
# every request. dotenv never overwrites a variable that is already set, so
# `docker run -e KEY=…` still wins over the baked file.
COPY --from=builder --chown=node:node /app/.env ./apps/${APP_DIRNAME}/.env

# Non-root. The `node` user ships with the base image, so there is nothing to
# create.
USER node

# The final WORKDIR is what lets CMD stay the plain `node server.js` — an exec-form
# CMD cannot expand a build ARG.
WORKDIR /app/apps/${APP_DIRNAME}

EXPOSE 3000
CMD ["node", "server.js"]
