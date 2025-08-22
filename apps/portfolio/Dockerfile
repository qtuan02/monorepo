# 1) Build-time arguments (can be overridden with --build-arg)
ARG NODE_VERSION=22
ARG APP_DIRNAME=portfolio
ARG PROJECT=@web/portfolio
ARG NODE_ENV=production
ARG VERSION=local

# 2) Base Alpine image + libc6-compat (fixes Next.js/Node runtime issues)
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# 3) Base image for all stages: enable corepack, install turbo, configure pnpm store
FROM alpine AS base
RUN corepack enable
RUN npm install turbo@2.5.5 --global
RUN pnpm config set store-dir ~/.pnpm-store

# 4) Pruner stage: prune the monorepo to only keep code + deps needed for PROJECT
FROM base AS pruner
ARG PROJECT
WORKDIR /app
COPY . .
RUN turbo prune --scope=${PROJECT} --docker

# 5) Builder stage: install deps from pruned lockfile and build the target app
FROM base AS builder    
ARG PROJECT
ARG APP_DIRNAME
ARG VERSION

# Build environment setup
ENV CI=true
ENV VERSION=${VERSION}
WORKDIR /app
ARG NODE_ENV
ENV BUILD_ENV=${NODE_ENV}
ENV NODE_ENV=production

# 5.1) Copy pruned lockfile/workspace + package manifests
COPY --from=pruner /app/.env.${BUILD_ENV} .env
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# 5.2) Install dependencies (with cache for faster rebuilds)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile && pnpm approve-builds

# 5.3) Copy full pruned source code and build the target project
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter=${PROJECT}

# 6) Runner stage: final lightweight image that only contains the app output
FROM base AS runner
ARG APP_DIRNAME
ENV NODE_ENV=production
ENV APP_NAME=${APP_DIRNAME}
WORKDIR /app

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 6.1) Copy standalone build output + static assets + public folder + env file
# (Next.js output file tracing -> minimal image size)
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_DIRNAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_DIRNAME}/.next/static ./apps/${APP_DIRNAME}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_DIRNAME}/public ./apps/${APP_DIRNAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/.env ./apps/${APP_DIRNAME}/.env

# 7) Expose the port and run the standalone Next.js server
ARG PORT=3000
EXPOSE ${PORT}
ENV APP_DIRNAME=${APP_DIRNAME}
ENV PORT=${PORT}
ENV HOSTNAME "0.0.0.0"
CMD node apps/${APP_DIRNAME}/server.js
