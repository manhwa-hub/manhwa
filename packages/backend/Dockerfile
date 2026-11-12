FROM node:20-alpine AS builder
WORKDIR /app

# Copy whole repo (needed for pnpm workspace)
COPY ../../ .

# Enable pnpm via corepack
RUN corepack enable && \
    pnpm install --frozen-lockfile && \
    pnpm run build:backend

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy compiled output
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./package.json
COPY --from=builder /app/packages/backend/tsconfig.json ./tsconfig.json

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]