# ────────────────────────────────
#  Stage 1 : build everything
# ────────────────────────────────
FROM node:20 AS builder
WORKDIR /usr/src/app

# 1️⃣  install all deps (incl. dev for React build)
COPY package*.json ./
RUN npm install

# 2️⃣  copy source and build React
COPY . .
RUN npm run build          # ➜ creates /usr/src/app/build/

# ────────────────────────────────
#  Stage 2 : slim runtime image
# ────────────────────────────────
FROM node:20-slim
WORKDIR /usr/src/app

# — backend runtime deps only —
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/server.mjs ./

# — put built React where start.sh expects it —
RUN mkdir -p frontend
COPY --from=builder /usr/src/app/build ./frontend/build

# — helper static server & script —
RUN npm install -g serve
COPY start.sh .
RUN chmod +x start.sh

# — expose both ports —
EXPOSE 8080 3000

# — launch backend + frontend (defined in start.sh) —
CMD ["./start.sh"]
