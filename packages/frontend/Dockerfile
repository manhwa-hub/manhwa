FROM node:20-alpine AS builder
WORKDIR /app

# Copy whole repo (needed for pnpm workspace)
COPY ../../ .

# Enable pnpm via corepack
RUN corepack enable && \
    pnpm install --frozen-lockfile && \
    pnpm run build:frontend

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/next.config.js ./next.config.js
COPY --from=builder /app/packages/frontend/package.json ./package.json

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "node_modules/next/dist/bin/next", "start"]