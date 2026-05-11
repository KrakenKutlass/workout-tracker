# Stage 1: Build React client
FROM node:20-alpine AS client-build
WORKDIR /app

# Copy workspace manifests so npm ci can resolve all workspaces
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

# Copy source and build
COPY client/ ./client/
RUN npm run build --workspace=client

# Stage 2: Production server
FROM node:20-alpine AS server
WORKDIR /app

# Install only server production dependencies (no workspaces needed)
COPY server/package.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/src/ ./src/

# Copy built client from stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Create data directory for SQLite volume mount
RUN mkdir -p /app/data && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=/app/data/rehab.db

EXPOSE 3001

CMD ["node", "src/index.js"]
