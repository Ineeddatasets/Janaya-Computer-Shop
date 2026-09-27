/**
 * Surface styles for module headers and primary actions.
 *
 * The system used to give every module its own colour, carried over from the
 * architecture diagram. That has been dropped: the whole product now reads as
 * one monochrome design, and colour is reserved for status. `accent()` is kept
 * so pages can go on naming their module without caring how it is painted.
 */
const ink = {
  text: 'text-ink',
  bg: 'bg-ink',
  hover: 'hover:bg-ink-2',
  soft: 'bg-mist',
  border: 'border-ink',
  ring: 'focus-visible:outline-ink',
}

export const accents = {
  navy: ink,
  login: ink,
  customer: ink,
  product: ink,
  sales: ink,
  report: ink,
  supplier: ink,
  dashboard: ink,
}

export function accent() {
  return ink
}
