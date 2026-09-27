/**
 * Report calculations, kept out of the screens so the dashboard and the
 * reports page cannot drift apart on what "today's sales" means.
 */

import { dayKey, monthKey, monthLabel } from './format.js'

export function inRange(sales, from, to) {
  const start = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T23:59:59')
  return sales.filter((sale) => {
    const at = new Date(sale.date)
    return at >= start && at <= end
  })
}

/** One point per calendar day, including days with no sales at all. */
export function dailySeries(sales, from, to) {
  const totals = new Map()
  sales.forEach((sale) => {
    const key = dayKey(sale.date)
    const current = totals.get(key) || { value: 0, orders: 0 }
    current.value += sale.total
    current.orders += 1
    totals.set(key, current)
  })

  const points = []
  const cursor = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (cursor <= end) {
    const key = dayKey(cursor)
    const entry = totals.get(key) || { value: 0, orders: 0 }
    points.push({
      key,
      label: cursor.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      value: Math.round(entry.value * 100) / 100,
      orders: entry.orders,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

export function monthlySeries(sales) {
  const totals = new Map()
  sales.forEach((sale) => {
    const key = monthKey(sale.date)
    const current = totals.get(key) || { value: 0, orders: 0 }
    current.value += sale.total
    current.orders += 1
    totals.set(key, current)
  })
  return [...totals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, entry]) => ({
      key,
      label: monthLabel(key),
      value: Math.round(entry.value * 100) / 100,
      orders: entry.orders,
    }))
}

export function bestSellers(sales, limit = 8) {
  const totals = new Map()
  sales.forEach((sale) => {
    sale.items.forEach((line) => {
      const current = totals.get(line.productId) || {
        productId: line.productId,
        name: line.name,
        sku: line.sku,
        qty: 0,
        revenue: 0,
      }
      current.qty += line.qty
      current.revenue += line.price * line.qty
      totals.set(line.productId, current)
    })
  })
  return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, limit)
}

export function inventorySummary(products) {
  const byCategory = new Map()
  products.forEach((product) => {
    const current = byCategory.get(product.category) || { label: product.category, value: 0, units: 0 }
    current.value += product.cost * product.stock
    current.units += product.stock
    byCategory.set(product.category, current)
  })

  return {
    skuCount: products.length,
    units: products.reduce((n, p) => n + p.stock, 0),
    costValue: products.reduce((n, p) => n + p.cost * p.stock, 0),
    retailValue: products.reduce((n, p) => n + p.price * p.stock, 0),
    low: products.filter((p) => p.stock > 0 && p.stock <= p.reorderPoint),
    out: products.filter((p) => p.stock === 0),
    byCategory: [...byCategory.values()].sort((a, b) => b.value - a.value),
  }
}

export function totals(sales) {
  const revenue = sales.reduce((n, s) => n + s.total, 0)
  const units = sales.reduce((n, s) => n + s.items.reduce((m, i) => m + i.qty, 0), 0)
  return {
    revenue,
    orders: sales.length,
    units,
    average: sales.length ? revenue / sales.length : 0,
  }
}

/** ISO date string for today and for N days back, ready for a date input. */
export function defaultRange(days = 29) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { from: dayKey(start), to: dayKey(end) }
}
