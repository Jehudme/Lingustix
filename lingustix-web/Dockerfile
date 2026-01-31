# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy source and build the application
COPY . .
# Note: For Next.js, ensure 'output: "export"' is set in next.config.js
RUN npm run build

# Runtime Stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the built files from the build stage
# Use "out" for Next.js static export or "dist" for standard React/Vite
COPY --from=build /app/out .

# Expose the default Nginx port
EXPOSE 80

# Run Nginx in the foreground
ENTRYPOINT ["nginx", "-g", "daemon off;"]