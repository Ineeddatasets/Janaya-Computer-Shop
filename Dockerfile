# Janaya Computer Shop — production image.
#
# One container runs the whole app: Express serves the built React frontend and
# the API on a single port. MySQL is a separate service (see docker-compose.yml,
# or a managed database in the cloud). No native modules, so Alpine needs no
# build toolchain.

# ---- Stage 1: build the frontend ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The server, the built app, and the seed data (so `npm run db:seed` works here).
COPY server ./server
COPY src/data ./src/data
COPY --from=build /app/dist ./dist

EXPOSE 4000
# Run migrations/seed once with:  docker compose exec app npm run db:reset
CMD ["node", "server/index.js"]
