FROM oven/bun:1 AS builder

# Add the build argument
ARG CAPROVER_GIT_COMMIT_SHA="unknown"

WORKDIR /app

# Copy package.json and lock files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build/optimize if needed (not required for this app)
# RUN bun run build

# Production image
FROM oven/bun:1-slim

# Pass the build arg to the production stage
ARG CAPROVER_GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=$CAPROVER_GIT_COMMIT_SHA

WORKDIR /app

# Copy node_modules and app files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/index.ts ./index.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose the port
ENV PORT=3000
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 bunuser \
    && adduser --system --uid 1001 --ingroup bunuser bunuser
USER bunuser

# Run the application
CMD ["bun", "run", "start"]