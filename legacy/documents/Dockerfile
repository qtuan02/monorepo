# 1) Build-time arguments (can be overridden with --build-arg)
ARG NODE_VERSION=22
ARG APP_DIRNAME=documents
ARG PROJECT=@monorepo/documents
ARG NODE_ENV=production
ARG VERSION=local

# 2) Base Alpine image + libc6-compat (fixes Node runtime issues)
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

# 6) Runner stage: final lightweight image with nginx to serve static files
FROM nginx:alpine AS runner
ARG APP_DIRNAME

# Copy nginx config for SPA routing
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/apps/${APP_DIRNAME}/dist /usr/share/nginx/html

# 7) Expose the port and run nginx
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
