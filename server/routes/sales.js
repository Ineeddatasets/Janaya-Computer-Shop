import { Router } from 'express'
import { pool, withTransaction } from '../db.js'
import { requireStaff } from '../auth.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError, VAT_RATE, money } from '../util.js'

/**
 * Sales. Staff only.
 *
 * Recording a sale is a single transaction: prices and stock are read from the
 * database under a row lock, totals are computed on the server (never trusted
 * from the client), stock is decremented, and the whole thing commits or none
 * of it does.
 */
export const salesRouter = Router()

/** Attaches line items to a set of sale rows with one extra query. */
async function withItems(runner, saleRows) {
  if (!saleRows.length) return []
  const ids = saleRows.map((s) => s.id)
  const [items] = await runner.query(
    'SELECT * FROM sale_items WHERE sale_id IN (?) ORDER BY id',
    [ids],
  )
  const bySale = new Map(ids.map((id) => [id, []]))
  for (const item of items) bySale.get(item.sale_id)?.push(item)
  return saleRows.map((s) => shape.sale(s, bySale.get(s.id) || []))
}

salesRouter.get(
  '/',
  requireStaff,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query('SELECT * FROM sales ORDER BY date DESC')
    res.json(await withItems(pool, rows))
  }),
)

// One sale by id or invoice number.
salesRouter.get(
  '/:id',
  requireStaff,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      'SELECT * FROM sales WHERE id = ? OR invoice_no = ? LIMIT 1',
      [req.params.id, req.params.id],
    )
    const row = rows[0]
    if (!row) throw new HttpError(404, 'Sale not found.')
    res.json((await withItems(pool, [row]))[0])
  }),
)

salesRouter.post(
  '/',
  requireStaff,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    const lines = Array.isArray(b.items) ? b.items : []
    if (!lines.length) throw new HttpError(400, 'Cannot record an empty sale.')

    const sale = await withTransaction(async (conn) => {
      // Lock each product row, read the authoritative price, check stock.
      const priced = []
      for (const line of lines) {
        const qty = Number(line.qty) || 0
        if (qty <= 0) throw new HttpError(400, 'Every line needs a quantity.')
        const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
          line.productId,
        ])
        const product = rows[0]
        if (!product) throw new HttpError(400, `Product ${line.productId} no longer exists.`)
        if (qty > product.stock) {
          throw new HttpError(400, `Only ${product.stock} left of ${product.name}.`)
        }
        priced.push({ product, qty })
      }

      const subtotal = money(priced.reduce((sum, l) => sum + l.product.price * l.qty, 0))
      const vat = money(subtotal * VAT_RATE)
      const total = money(subtotal + vat)
      const tendered = money(Number(b.payment?.tendered) || total)
      const change = money(tendered - total)
      const method = b.payment?.method || 'Cash'

      // Resolve the customer for the receipt; unknown ids fall back to walk-in.
      let customerId = null
      let customerName = 'Walk-in Customer'
      if (b.customerId) {
        const [rows] = await conn.query('SELECT id, name FROM customers WHERE id = ?', [
          b.customerId,
        ])
        if (rows[0]) {
          customerId = rows[0].id
          customerName = rows[0].name
        }
      }

      const [[{ n }]] = await conn.query(
        'SELECT COALESCE(MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)), 0) + 1 AS n FROM sales',
      )
      const id = 'SL-' + String(n).padStart(5, '0')
      const invoiceNo = 'INV-' + (10000 + n)

      await conn.query(
        `INSERT INTO sales
           (id, invoice_no, date, customer_id, customer_name, cashier_id, cashier_name,
            subtotal, vat, total, payment_method, payment_tendered, payment_change)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          invoiceNo,
          // A JS Date, not SQL NOW(): the pool stores and reads it in UTC, so
          // the instant is consistent. NOW() would write the server's local
          // time, which the UTC-reading pool then shifts by the offset.
          new Date(),
          customerId,
          customerName,
          req.user.id,
          req.user.name,
          subtotal,
          vat,
          total,
          method,
          tendered,
          change,
        ],
      )

      for (const { product, qty } of priced) {
        await conn.query(
          'INSERT INTO sale_items (sale_id, product_id, sku, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)',
          [id, product.id, product.sku, product.name, product.price, qty],
        )
        await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, product.id])
      }

      const [saleRows] = await conn.query('SELECT * FROM sales WHERE id = ?', [id])
      return (await withItems(conn, saleRows))[0]
    })

    res.status(201).json(sale)
  }),
)
