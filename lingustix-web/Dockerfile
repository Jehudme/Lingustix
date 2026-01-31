# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# 1. Capture the argument from compose
ARG NEXT_PUBLIC_API_URL

# 2. Set it as an environment variable for the build command
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files and install dependencies to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy source and build the application
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]