/** Shared helpers: typed HTTP errors, an async wrapper, and money rounding. */

/** The authoritative VAT rate. The frontend keeps its own copy for display; the server is the source of truth for what a sale actually charges. */
export const VAT_RATE = 0.12

export const CATEGORIES = [
  'Laptops',
  'Desktops',
  'Components',
  'Peripherals',
  'Storage',
  'Networking',
  'Accessories',
]

/** An error carrying an HTTP status. Thrown anywhere, rendered by the error handler. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/** Wraps an async route so a rejected promise reaches Express's error handler. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

/** Rounds to whole centavos, avoiding binary-float drift on money. */
export function money(value) {
  return Math.round(Number(value) * 100) / 100
}
