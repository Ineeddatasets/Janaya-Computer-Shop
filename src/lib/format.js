/** Shared formatters. The shop trades in Philippine pesos. */

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

const pesoCompact = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function money(value) {
  return peso.format(Number(value) || 0)
}

export function moneyRound(value) {
  return pesoCompact.format(Number(value) || 0)
}

export function count(value) {
  return new Intl.NumberFormat('en-PH').format(Number(value) || 0)
}

export function dateShort(value) {
  return new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function dateTime(value) {
  return new Date(value).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Local YYYY-MM-DD. Never use toISOString here — it shifts across midnight. */
export function dayKey(value) {
  const d = new Date(value)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() + '-' + m + '-' + day
}

export function monthKey(value) {
  const d = new Date(value)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export function monthLabel(key) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-PH', {
    month: 'short',
    year: 'numeric',
  })
}

export function initials(name) {
  return String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
