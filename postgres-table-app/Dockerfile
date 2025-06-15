# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Define build arguments for Cognito configuration
ARG NEXT_PUBLIC_COGNITO_REGION
ARG NEXT_PUBLIC_COGNITO_USER_POOL_ID
ARG NEXT_PUBLIC_COGNITO_APP_CLIENT_ID
ARG NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID

# Set environment variables for build time
ENV NEXT_PUBLIC_COGNITO_REGION=${NEXT_PUBLIC_COGNITO_REGION}
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=${NEXT_PUBLIC_COGNITO_USER_POOL_ID}
ENV NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=${NEXT_PUBLIC_COGNITO_APP_CLIENT_ID}
ENV NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=${NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID}

# Copy package files
COPY package.json ./

# Install dependencies with only production dependencies
RUN npm install --production=false

# Copy application code (respecting .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]