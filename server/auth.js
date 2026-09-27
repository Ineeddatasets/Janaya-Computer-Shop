import { HttpError } from './util.js'

/**
 * Authorisation middleware.
 *
 * The frontend hides links a role may not use; these guards enforce the same
 * rules on the server, where they actually count. The signed-in user lives on
 * the session, never in the request body, so a client cannot claim a role or a
 * different identity.
 */

/** Copies the session user onto req.user (or null) for every request. */
export function attachUser(req, _res, next) {
  req.user = req.session?.user || null
  next()
}

export function requireStaff(req, _res, next) {
  if (!req.user) throw new HttpError(401, 'Please sign in.')
  if (req.user.role !== 'owner' && req.user.role !== 'cashier') {
    throw new HttpError(403, 'Staff access only.')
  }
  next()
}

export function requireOwner(req, _res, next) {
  if (!req.user) throw new HttpError(401, 'Please sign in.')
  if (req.user.role !== 'owner') {
    throw new HttpError(403, 'Only the store owner can do that.')
  }
  next()
}

export const isStaff = (user) => user?.role === 'owner' || user?.role === 'cashier'
