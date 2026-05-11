# Stage 1: Build React client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS server
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client from stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Create data directory for SQLite volume mount
RUN mkdir -p /app/server/data

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/src/index.js"]
