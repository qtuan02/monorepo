ARG BUN_VERSION=1.4.0
ARG NODE_VERSION=24
ARG APP_DIRNAME=_template_reactrouter
ARG PROJECT=@monorepo/_template_reactrouter
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
# this image's PUBLIC_* values. The default is the committed example so a bare
# `docker build` still produces a working image; a real deploy passes
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
# Vite's `envDir: "../../"` points here, and the app's own `build` script loads
# it with `dotenv -e ../../.env --`. Unlike the other two Runtimes it is copied a
# SECOND time, into the runner: this app's `env.ts` declares a server key that
# stays a live `process.env` read inside the server bundle. See the runner stage.
COPY .env.${BUILD_ENV} .env

# After `bun install`, so that step still sees the devDependencies the build needs.
ENV NODE_ENV=${NODE_ENV}

# Validate against the same module the app parses at runtime, so a missing or
# malformed variable fails the image build here — named — instead of shipping a
# server that only breaks on its first request.
#
# This Runtime is the one where a single import covers BOTH halves of the schema.
# `import.meta.env` is an alias of `process.env` under Bun, so the `PUBLIC_*`
# client block is parsed; and `typeof process` is defined, so the `server` block
# is parsed too — which is exactly why `src/env.ts` guards that read with
# `typeof process` rather than `import.meta.env.SSR`. A missing
# `TEMPLATE_REACTROUTER_SESSION_SECRET` therefore fails HERE, by name, rather
# than at the container's first request.
#
# Runs from the app's own directory so its `@monorepo/env` dependency resolves,
# and names the env file explicitly: Bun only auto-loads a `.env` sitting in the
# cwd, so the root one is invisible from inside `apps/`.
RUN cd apps/${APP_DIRNAME} && bun --env-file=/app/.env -e "import './src/env.ts';"

RUN bun run build --filter=${PROJECT}

# The runner ships no `@monorepo/*` package at all: Vite does not externalize a
# LINKED workspace dependency in an SSR build, so `@monorepo/env` and
# `@monorepo/i18n` are compiled into `build/server/index.js` as source. That is
# an assumption about a bundler, not a guarantee — the day it stops holding, the
# image would boot into ERR_MODULE_NOT_FOUND instead of failing here, so one
# anchored grep keeps it honest. The pattern is anchored at `^import` because the
# bundle legitimately keeps `@monorepo/…` inside preserved JSDoc comments, and a
# bare substring match would fail on those.
RUN ! grep -qE '^import[^;]*"@monorepo/' apps/${APP_DIRNAME}/build/server/index.js

# Step 4: Prod-deps Layer — the runtime dependency closure, and nothing else.
# This Runtime has no `output: "standalone"` and no dependency tracer:
# `react-router build` emits a bundle that still imports react, react-dom/server,
# react-router, @react-router/node, isbot and zod by bare specifier, and
# `@react-router/serve` is a real package that has to be on disk to be executed.
# So the image carries a node_modules, and this stage is what keeps it to the
# production half — a second, clean resolution rather than a slimming pass,
# because `bun install --production` does not remove devDependencies already
# written into an existing tree.
FROM base AS prod-deps
ARG NODE_ENV
WORKDIR /app

# `out/json` only: this stage installs, it never builds, so it needs the
# manifests and the lockfile and nothing else.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/bunfig.toml ./bunfig.toml

# `--linker=hoisted` overrides the `isolated` in `bunfig.toml`, and it is the
# whole reason the runner can copy ONE directory. Isolated resolves every
# specifier through a relative symlink into `node_modules/.bun/<pkg>@<ver>/…`, so
# copying `node_modules` alone into a fresh stage yields a tree of dangling links
# and the container dies on its first `import "react-router"`. Hoisted gives the
# npm-shaped flat layout Node resolves by walking up from
# `/app/build/server/index.js`.
#
# Deliberately no `--filter`: `turbo prune --docker` has already cut the
# workspace down to this app's closure, so the flag would only risk
# under-installing a transitive runtime dependency. Deliberately no `--omit=peer`
# either — `react-router` is a peer of `@react-router/serve` and is load-bearing
# at runtime, and no flag here is worth an ERR_MODULE_NOT_FOUND on boot.
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --linker=hoisted

# The workspace links resolve to `/app/packages/*`, which the runner never
# receives — they would arrive as dangling symlinks. Nothing imports them (the
# builder's grep above is what proves that), so they are removed here rather than
# followed by a copy of source the image has no use for. Their own runtime
# dependencies stay hoisted at `/app/node_modules` and are untouched.
RUN rm -rf node_modules/@monorepo

# Step 5: Runner Layer — Node, not Bun and not nginx. Bun builds; the process
# that answers requests is `@react-router/serve`, an Express server, on the Node
# the workspace's `engines` and `.nvmrc` name.
FROM node:${NODE_VERSION}-alpine AS runner
ARG APP_DIRNAME

ENV NODE_ENV=production

# Mandatory, not a default worth having. `@react-router/serve` reads `PORT` and
# nothing else — it has no flag and no config file — and with `PORT` unset the
# port stops being declared and becomes PROBED: `getAvailablePort(3000, HOST)`
# opens a throwaway socket on 3000, closes it, and only then does express
# `listen`. So the usual case still lands on 3000, but by a check-then-act race
# rather than by contract, and the moment anything else in the container holds
# 3000 the fallback is `checkPort(0)` — an ephemeral port nobody can publish or
# predict, chosen silently. `ENV PORT` makes it a declaration again. This 3000 is
# the port INSIDE the container, deliberately independent of `ports.env`
# (3005/3105): a container has its own network namespace, so it cannot collide
# with a dev or E2E server, and `gen:app` does not rewrite it.
ENV PORT=3000

# `HOST` is deliberately NOT set, and that is the inverse of the Next runner's
# `ENV HOSTNAME=0.0.0.0` — the two servers default differently. Next's
# `server.js` defaults to `localhost` and has to be widened; this one does
# `process.env.HOST ? app.listen(port, HOST) : app.listen(port)`, and the bare
# `listen(port)` already binds every interface. Setting `HOST` here could only
# narrow it: `0.0.0.0` drops IPv6, `127.0.0.1` makes the container unreachable
# through `-p` at all.

# Load-bearing. The server build bakes `assetsBuildDirectory` as the RELATIVE
# string "build/client", and `@react-router/serve` hands it to `express.static`
# unresolved — so it is read against the process cwd. WORKDIR is what makes
# `/app/build/client` the directory that answers `/assets/*`. Move the build one
# level and the HTML still renders 200 while every asset 404s, a failure a
# `curl -I /` check walks straight past.
WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules

# The app's own manifest, for exactly one field: `"type": "module"`.
# `build/server/index.js` is ESM with a `.js` extension, so without a package
# boundary declaring the type Node parses it as CommonJS and dies on the first
# `import`.
COPY --from=builder --chown=node:node /app/apps/${APP_DIRNAME}/package.json ./package.json

# Both halves of one build. `build/client` is what the static handler serves, and
# `public/` is already folded into it by `react-router build` — which is why
# there is no second COPY of `public/` the way the Next runner needs one.
COPY --from=builder --chown=node:node /app/apps/${APP_DIRNAME}/build ./build

# The environment file the builder was given. Every `PUBLIC_*` was inlined into
# both bundles at build time, but the server key is compiled into
# `build/server/index.js` as a live
# `process.env.TEMPLATE_REACTROUTER_SESSION_SECRET` read that `createEnv`
# evaluates at module load — and `react-router-serve` loads no dotenv file of its
# own (the `start` script gets one from a dotenv-cli prefix, and dotenv-cli is a
# devDependency this image does not have). Without this the container boots
# straight into `Invalid environment variables:
# TEMPLATE_REACTROUTER_SESSION_SECRET` and answers nothing. Same role as the Next
# runner's `.env` COPY, different loader — see the CMD.
COPY --from=builder --chown=node:node /app/.env ./.env

# Non-root. The `node` user (uid 1000) ships with the base image, so there is
# nothing to create.
USER node

EXPOSE 3000

# Exec form, and `node` against the package's own bin rather than the app's
# `start` script, so that node is PID 1. `@react-router/serve` registers
# `process.once("SIGTERM", () => server.close(…))`; put a shell — or `bun run
# start`, or `npx` — at PID 1 and that handler never runs, so `docker stop` waits
# out its ten seconds and SIGKILLs instead (exit 137). The path is a literal
# because an exec-form CMD cannot expand a build ARG; the hoisted install above
# is what puts the bin at exactly this path.
#
# `--env-file-if-exists` rather than `--env-file`: Node does not overwrite a
# variable that is already set, so `docker run -e
# TEMPLATE_REACTROUTER_SESSION_SECRET=…` still wins over the baked file — and an
# operator who bind-mounts over `/app/.env` gets the named error from `createEnv`
# rather than a Node startup failure about a missing file.
CMD ["node", "--env-file-if-exists=/app/.env", "node_modules/@react-router/serve/bin.cjs", "./build/server/index.js"]
