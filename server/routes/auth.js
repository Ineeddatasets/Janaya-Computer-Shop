import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError } from '../util.js'

/**
 * Authentication.
 *
 * One door for all three roles. On success the safe user (never the password
 * hash) is written to the session; the browser holds only an opaque cookie.
 */
export const authRouter = Router()

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) {
      throw new HttpError(400, 'Enter your username and password.')
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = ? LIMIT 1',
      [String(username).trim().toLowerCase()],
    )
    const row = rows[0]
    const ok = row && (await bcrypt.compare(String(password), row.password_hash))
    if (!ok) throw new HttpError(401, 'Incorrect username or password.')

    const user = shape.user(row)
    // Guard against session fixation: a fresh id once credentials are proven.
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Could not start a session.' })
      req.session.user = user
      res.json(user)
    })
  }),
)

authRouter.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in.' })
  res.json(req.user)
})

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('janaya.sid')
    res.json({ ok: true })
  })
})
