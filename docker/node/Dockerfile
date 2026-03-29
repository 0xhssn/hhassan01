# ============================================================
#  Node.js development image
#  Includes: Node.js (LTS), npm, yarn, pnpm, TypeScript,
#            NestJS CLI, Next.js CLI, eslint, prettier
# ============================================================

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bookworm-slim

# ---- system dependencies --------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      curl \
      wget \
      ca-certificates \
      gnupg \
      build-essential \
      python3 \
      procps \
      unzip \
      jq \
    && rm -rf /var/lib/apt/lists/*

# ---- package managers -----------------------------------
# pnpm (fast, disk-efficient)
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- global CLI tools -----------------------------------
RUN npm install -g \
      typescript \
      ts-node \
      @nestjs/cli \
      create-next-app \
      eslint \
      prettier \
      nodemon \
      concurrently \
      dotenv-cli

# ---- user setup -----------------------------------------
# Node official image already has a non-root "node" user (uid 1000)
RUN mkdir -p /workspace && chown node:node /workspace

USER node
WORKDIR /workspace

# ---- shell convenience ----------------------------------
ENV PATH="/workspace/node_modules/.bin:${PATH}"

EXPOSE 3000 3001

# Default: keep container alive for docker exec / VS Code attach
CMD ["sleep", "infinity"]
