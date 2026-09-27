import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import express from 'express'
import session from 'express-session'
import expressMySQLSession from 'express-mysql-session'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { config, pool } from './db.js'
import { attachUser } from './auth.js'
import { authRouter } from './routes/auth.js'
import { productsRouter } from './routes/products.js'
import { customersRouter } from './routes/customers.js'
import { suppliersRouter } from './routes/suppliers.js'
import { purchaseOrdersRouter } from './routes/purchaseOrders.js'
import { salesRouter } from './routes/sales.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const app = express()

// Behind a proxy (Render, Railway, nginx) so secure cookies and the client IP
// for rate limiting are read from the forwarded headers.
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1)

app.use(
  helmet({
    // The served app pulls fonts from Google and product photos from Unsplash;
    // everything else stays same-origin.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // allow the external product photos
  }),
)

app.use(express.json({ limit: '1mb' }))

// Sessions live in MySQL so they survive restarts and work across instances.
const MySQLStore = expressMySQLSession(session)
const sessionStore = new MySQLStore({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
})

app.use(
  session({
    name: 'janaya.sid',
    secret: process.env.SESSION_SECRET || 'change-me-in-env',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // Set COOKIE_SECURE=true once you are serving over HTTPS.
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week
    },
  }),
)

app.use(attachUser)

// Health check for deploy platforms.
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false })
  }
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes.' },
})
app.use('/api/auth/login', loginLimiter)

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/suppliers', suppliersRouter)
app.use('/api/purchase-orders', purchaseOrdersRouter)
app.use('/api/sales', salesRouter)

// Anything under /api that fell through is a genuine 404, not the SPA.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

// In production the same server hands out the built React app; the SPA router
// handles every non-API path. In development Vite serves the app on :5173 and
// proxies /api here, so this block stays dormant.
const distPath = path.join(__dirname, '..', 'dist')
if (isProd && fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  app.get('/', (_req, res) =>
    res.type('text').send('Janaya API is running. In development the app is served by Vite on :5173.'),
  )
}

// One error shape for the whole API: { error }. The frontend reads .error.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.message || 'Something went wrong.' })
})

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Janaya API listening on http://localhost:${port} (${isProd ? 'production' : 'development'})`)
})
