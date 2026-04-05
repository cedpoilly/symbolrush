# Stage 1: Dependencies
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build

# Git info for version generation (passed from CI since .git is not in Docker)
ARG BUILD_COMMIT
ARG BUILD_BRANCH
ARG BUILD_COMMITS
ARG BUILD_VERSION

ENV BUILD_COMMIT=${BUILD_COMMIT}
ENV BUILD_BRANCH=${BUILD_BRANCH}
ENV BUILD_COMMITS=${BUILD_COMMITS}
ENV BUILD_VERSION=${BUILD_VERSION}

COPY . .
RUN pnpm build

# Stage 3: Production
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fs http://localhost:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
