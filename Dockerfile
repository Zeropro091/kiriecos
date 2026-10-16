# ---------- Stage 1: build the frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

# ---------- Stage 2: build the backend ----------
FROM node:22-alpine AS backend
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
COPY server/scripts ./scripts
RUN npm run build

# ---------- Stage 3: runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend /app/server/dist ./dist
COPY --from=frontend /app/dist /app/dist

ENV FRONTEND_DIST=/app/dist
ENV PORT=4000
EXPOSE 4000

RUN addgroup -S kiri && adduser -S kiri -G kiri && mkdir -p /app/server/uploads && chown -R kiri:kiri /app/server
USER kiri

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
