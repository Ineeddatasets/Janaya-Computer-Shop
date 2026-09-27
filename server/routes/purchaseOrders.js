import { Router } from 'express'
import { pool, nextId, withTransaction } from '../db.js'
import { requireOwner } from '../auth.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError } from '../util.js'

/**
 * Purchase orders. The owner's module, alongside suppliers.
 *
 * Marking an order delivered is the one place stock rises outside a manual
 * adjustment, done in a transaction so the receipt and the shelf never
 * disagree.
 */
export const purchaseOrdersRouter = Router()

const SELECT = `SELECT id, supplier_id,
                       DATE_FORMAT(order_date, '%Y-%m-%d') AS order_date,
                       DATE_FORMAT(expected_date, '%Y-%m-%d') AS expected_date,
                       status
                FROM purchase_orders`

/** Attaches each order's line items, one extra query for the whole set. */
async function withItems(runner, orderRows) {
  if (!orderRows.length) return []
  const ids = orderRows.map((o) => o.id)
  const [items] = await runner.query(
    'SELECT * FROM purchase_order_items WHERE po_id IN (?) ORDER BY id',
    [ids],
  )
  const byOrder = new Map(ids.map((id) => [id, []]))
  for (const item of items) byOrder.get(item.po_id)?.push(item)
  return orderRows.map((o) => shape.purchaseOrder(o, byOrder.get(o.id) || []))
}

purchaseOrdersRouter.get(
  '/',
  requireOwner,
  asyncHandler(async (_req, res) => {
    const [orders] = await pool.query(`${SELECT} ORDER BY order_date DESC, id DESC`)
    res.json(await withItems(pool, orders))
  }),
)

purchaseOrdersRouter.post(
  '/',
  requireOwner,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    if (!b.supplierId) throw new HttpError(400, 'Choose a supplier.')
    const items = Array.isArray(b.items) ? b.items : []
    if (!items.length) throw new HttpError(400, 'A purchase order needs at least one item.')

    const order = await withTransaction(async (conn) => {
      const id = await nextId(conn, 'purchase_orders', 'id', 'PO-', 4)
      await conn.query(
        `INSERT INTO purchase_orders (id, supplier_id, order_date, expected_date, status)
         VALUES (?, ?, ?, ?, 'Pending')`,
        [id, b.supplierId, b.orderDate || new Date(), b.expectedDate || null],
      )
      for (const line of items) {
        await conn.query(
          'INSERT INTO purchase_order_items (po_id, product_id, qty, cost) VALUES (?, ?, ?, ?)',
          [id, line.productId, Number(line.qty) || 0, Number(line.cost) || 0],
        )
      }
      const [rows] = await conn.query(`${SELECT} WHERE id = ?`, [id])
      return (await withItems(conn, rows))[0]
    })
    res.status(201).json(order)
  }),
)

purchaseOrdersRouter.post(
  '/:id/status',
  requireOwner,
  asyncHandler(async (req, res) => {
    const status = String(req.body?.status || '').trim()
    if (!status) throw new HttpError(400, 'A status is required.')

    const order = await withTransaction(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM purchase_orders WHERE id = ? FOR UPDATE', [
        req.params.id,
      ])
      if (!rows[0]) throw new HttpError(404, 'Purchase order not found.')

      const becomingDelivered = status === 'Delivered' && rows[0].status !== 'Delivered'
      await conn.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, req.params.id])

      if (becomingDelivered) {
        const [items] = await conn.query(
          'SELECT product_id, qty FROM purchase_order_items WHERE po_id = ?',
          [req.params.id],
        )
        for (const item of items) {
          if (!item.product_id) continue // product was deleted since ordering
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [
            item.qty,
            item.product_id,
          ])
        }
      }

      const [updated] = await conn.query(`${SELECT} WHERE id = ?`, [req.params.id])
      return (await withItems(conn, updated))[0]
    })
    res.json(order)
  }),
)
