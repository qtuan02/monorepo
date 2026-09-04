# Global Arguments
ARG BUN_VERSION=1.4.0
ARG APP_DIRNAME=storybook
ARG PROJECT=@monorepo/storybook
ARG NODE_ENV=production

# Step 1: Base Layer
FROM oven/bun:${BUN_VERSION}-alpine AS base
RUN apk update && apk add --no-cache libc6-compat

# Step 2: Pruner Layer
FROM base AS pruner
ARG PROJECT
WORKDIR /app
COPY . .
RUN bunx turbo prune ${PROJECT} --docker

# Step 3: Builder Layer
FROM base AS builder
ARG PROJECT
ARG NODE_ENV

WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/bunfig.toml ./bunfig.toml

RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# No `.env.<BUILD_ENV>` COPY like the app images: Storybook previews
# @monorepo/ui and reads no PUBLIC_* at all, so NODE_ENV is the whole of its
# build config. Set after `bun install`, so that step still sees the
# devDependencies the build needs.
ENV NODE_ENV=${NODE_ENV}

RUN bun run build --filter=${PROJECT}

# Step 4: Runner Layer
FROM nginx:stable-alpine AS runner
ARG APP_DIRNAME

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/apps/${APP_DIRNAME}/dist /usr/share/nginx/html
COPY --from=builder /app/apps/${APP_DIRNAME}/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
