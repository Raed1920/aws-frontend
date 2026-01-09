# =========================
# 1️⃣ Build React app
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Environment variable used by React
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build React
RUN npm run build


# =========================
# 2️⃣ Nginx runtime
# =========================
FROM nginx:alpine

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/frontend.conf

# Copy React build
COPY --from=builder /app/build /usr/share/nginx/html

# Health check page
RUN printf '<!DOCTYPE html><html><body><h1>OK</h1></body></html>' \
  > /usr/share/nginx/html/health.html

EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
