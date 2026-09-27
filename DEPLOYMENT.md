# Deploying Janaya Computer Shop

The app is one Node process. In production Express serves the built React
frontend and the `/api` routes on a single port, so there is one thing to run
and no CORS to configure. MySQL is the only external dependency.

Everything is driven by environment variables, so the same code runs locally on
XAMPP, on a managed host, on a VPS, or in Docker — only the `.env` changes.

## Environment variables

| Variable | What it does | Example |
| --- | --- | --- |
| `PORT` | Port the server listens on | `4000` (hosts set this for you) |
| `NODE_ENV` | `production` serves the built app and enables secure defaults | `production` |
| `DB_HOST` | MySQL host | `127.0.0.1`, `db`, or a managed host |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` or a dedicated user |
| `DB_PASSWORD` | MySQL password | empty on XAMPP, set everywhere else |
| `DB_NAME` | Database name | `janaya_shop` |
| `SESSION_SECRET` | Signs session cookies — **must be long and random** | 96 hex chars |
| `COOKIE_SECURE` | `true` only when served over HTTPS | `true` in production |
| `TRUST_PROXY` | `true` behind a reverse proxy or PaaS | `true` on Render/Railway/nginx |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## npm scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Vite (`:5173`) and the API (`:4000`) together, with `/api` proxied |
| `npm run build` | Builds the frontend to `dist/` |
| `npm start` | Production server: serves `dist/` and the API on `PORT` |
| `npm run db:migrate` | Creates the database and applies the schema (destructive) |
| `npm run db:seed` | Loads the demo catalogue, customers, suppliers and sales |
| `npm run db:reset` | `db:migrate` then `db:seed` |

`db:migrate` drops and recreates every table. Run it against a fresh or
disposable database, then seed.

---

## 1. Local development (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel (Apache is not needed).
2. Set up the project:
   ```bash
   cp .env.example .env
   # edit .env: set SESSION_SECRET; XAMPP defaults are user root, empty password
   npm install
   npm run db:reset
   npm run dev
   ```
3. Open http://localhost:5173. Sign in with `owner` / `owner123`,
   `cashier` / `cashier123`, or `cherry` / `cherry123`.

## 2. A single server you control (VPS)

Install Node 20+ and MySQL 8 on the server, then:

```bash
git clone <your repo> && cd "Computer Shop"
cp .env.example .env      # set real DB creds, a strong SESSION_SECRET
#                           NODE_ENV=production, COOKIE_SECURE=true, TRUST_PROXY=true
npm ci
npm run build
npm run db:reset          # first deploy only
npm start                 # or run under a process manager, below
```

Keep it running with PM2:

```bash
npm i -g pm2
pm2 start "npm start" --name janaya
pm2 save && pm2 startup
```

Put nginx in front to terminate HTTPS (set `COOKIE_SECURE=true`):

```nginx
server {
  listen 80;
  server_name shop.example.com;
  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Use Certbot for the TLS certificate. Because `TRUST_PROXY=true`, the app reads
the forwarded protocol and client IP correctly.

## 3. Railway (easiest managed host)

Railway is the recommended managed option because it provisions **MySQL** in one
click alongside the Node service. Render is also fine for the app itself, but its
managed database is PostgreSQL — on Render you would bring your own MySQL (Aiven,
Clever Cloud, or similar) and point `DB_*` at it.

1. Push the repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo**, pick this repo.
3. In the same project: **New → Database → MySQL**.
4. On the app service, set variables (Railway exposes the database's own as
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`):
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   NODE_ENV=production
   SESSION_SECRET=<a long random string>
   COOKIE_SECURE=true
   TRUST_PROXY=true
   ```
   Do **not** set `PORT` — the platform provides it.
5. Build command `npm install && npm run build`, start command `npm start`.
6. Deploy, then run the one-time schema and seed once from the service shell:
   ```bash
   npm run db:reset
   ```
7. Generate a public domain under Settings → Networking.

Health check path for the platform: `/api/health`.

## 5. Why not Netlify or Vercel

Both host static sites and short-lived serverless functions. This app is a
long-running Express process that holds a MySQL connection pool and keeps
sessions in the database, and neither platform provides MySQL. Deploying it
there as-is does not work.

It *can* be done, but it means changing the architecture:

- Export the Express app as a serverless handler instead of calling `listen`.
- Replace the MySQL session store with stateless signed cookies (JWT) or a
  serverless-friendly store, because functions do not share memory or pools.
- Host MySQL somewhere else anyway and use a driver suited to serverless.

If the frontend must live on Vercel or Netlify, the cleaner split is: static
frontend there, this server on Railway, and `VITE_API_ORIGIN` pointed at it —
which then needs CORS plus `SameSite=None; Secure` cookies. Hosting both halves
together, as above, avoids all of that.

## 4. Docker

```bash
cp .env.example .env      # set SESSION_SECRET and DB_PASSWORD
docker compose up --build -d
docker compose exec app npm run db:reset   # first run only
```

Open http://localhost:4000. The database persists in the `dbdata` volume.

---

## Security checklist before going live

- [ ] `SESSION_SECRET` is long, random, and not committed.
- [ ] `COOKIE_SECURE=true` and the site is served over HTTPS.
- [ ] `TRUST_PROXY=true` if there is a proxy in front.
- [ ] The database user is dedicated with a real password (not root/empty).
- [ ] `.env` is never committed (it is gitignored).
- [ ] `db:migrate` is not run against production data — it drops tables.

## How it fits together

- Passwords are stored as bcrypt hashes; login compares against the hash.
- Sessions live in MySQL (an auto-created `sessions` table), so they survive
  restarts and work across multiple instances. The browser holds only an opaque
  `httpOnly` cookie.
- The API enforces roles on every route: the storefront reads products without
  cost, staff manage the shop, only the owner deletes or sees reports, and a
  customer can touch only their own record and receipts.
- Recording a sale is one transaction: prices and stock are read under a row
  lock, totals are computed on the server, and stock is decremented atomically.
