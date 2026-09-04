ARG BUN_VERSION=1.4.0
ARG APP_DIRNAME=documents
ARG PROJECT=@monorepo/documents
ARG NODE_ENV=production

# Step 1: Base Layer
FROM oven/bun:${BUN_VERSION}-alpine AS base
RUN apk update && apk add --no-cache libc6-compat

# Step 2: Pruner Layer — everything this app does not import is dropped here, so
# a change in an unrelated workspace cannot invalidate the install layer below.
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

# Build-per-env (ADR-0004): names which `.env.<BUILD_ENV>` file in the build
# context holds this image's PUBLIC_* values — see the COPY below. The default
# is the committed example so a bare `docker build` still produces a working
# image; a real deploy passes `--build-arg BUILD_ENV=production`.
ARG BUILD_ENV=example

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/bunfig.toml ./bunfig.toml

RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# The target environment's file becomes the root `.env` every later step reads —
# Vite's `envDir: "../../"` points here, and Bun auto-loads it for `bun run build`.
# `.env*` is gitignored apart from `.env.example`, so a deploy pipeline drops the
# real file into the build context first; a missing one fails this COPY rather
# than baking an empty config into the bundle.
COPY .env.${BUILD_ENV} .env

# After `bun install`, so that step still sees the devDependencies the build needs.
ENV NODE_ENV=${NODE_ENV}

# Validate by importing the app's own env module, so the image build parses the
# *same* schema the browser will — there is no second copy of the schema here to
# drift. It works because `import.meta.env` is Vite's baked record in the browser
# and an alias of `process.env` under Bun. A missing or malformed PUBLIC_* fails
# here, named, instead of shipping a bundle that only breaks once a component
# reads `env.<field>`.
#
# Runs from the app's own directory so its `@monorepo/env` dependency resolves,
# and names the env file explicitly: Bun only auto-loads a `.env` sitting in the
# cwd, so the root one is invisible from inside `apps/`.
RUN cd apps/${APP_DIRNAME} && bun --env-file=/app/.env -e "import './src/env.ts';"

RUN bun run build --filter=${PROJECT}

# Step 4: Runner Layer — nginx serving the pre-built, env-baked static bundle.
# No Node, no boot-time script: the base image's own entrypoint runs nginx directly.
FROM nginx:stable-alpine AS runner
ARG APP_DIRNAME

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/apps/${APP_DIRNAME}/dist /usr/share/nginx/html

# Without this the image runs the stock config: no SPA fallback (a refresh on
# /sign-in 404s) and no Cache-Control on the HTML entry. See the file for the
# reasoning.
COPY apps/${APP_DIRNAME}/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
