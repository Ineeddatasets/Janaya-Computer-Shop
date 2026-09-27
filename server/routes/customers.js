import { Router } from 'express'
import { pool, nextId, withTransaction } from '../db.js'
import { requireStaff, requireOwner } from '../auth.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError } from '../util.js'

/**
 * Customers — records the staff manage. Customers are not logins; only the
 * owner and cashiers reach these routes. Deletion is the owner's call.
 */
export const customersRouter = Router()

// DATE comes back as a plain 'YYYY-MM-DD' string, sidestepping timezone drift.
const SELECT = `SELECT id, name, phone, email, address, type,
                       DATE_FORMAT(joined, '%Y-%m-%d') AS joined
                FROM customers`

async function findCustomer(runner, id) {
  const [rows] = await runner.query(`${SELECT} WHERE id = ?`, [id])
  if (!rows[0]) throw new HttpError(404, 'Customer not found.')
  return rows[0]
}

customersRouter.get(
  '/',
  requireStaff,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(`${SELECT} ORDER BY name`)
    res.json(rows.map(shape.customer))
  }),
)

customersRouter.post(
  '/',
  requireStaff,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    if (!b.name) throw new HttpError(400, 'A name is required.')
    const customer = await withTransaction(async (conn) => {
      const id = await nextId(conn, 'customers', 'id', 'C-', 3)
      await conn.query(
        `INSERT INTO customers (id, name, phone, email, address, type, joined)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
        [id, b.name, b.phone || '', b.email || '', b.address || '', b.type || 'Walk-in'],
      )
      return findCustomer(conn, id)
    })
    res.status(201).json(shape.customer(customer))
  }),
)

const FIELDS = { name: 'name', phone: 'phone', email: 'email', address: 'address', type: 'type' }

customersRouter.patch(
  '/:id',
  requireStaff,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    const sets = []
    const values = []
    for (const [key, column] of Object.entries(FIELDS)) {
      if (b[key] === undefined) continue
      sets.push(`${column} = ?`)
      values.push(b[key])
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to update.')

    const customer = await withTransaction(async (conn) => {
      await findCustomer(conn, req.params.id)
      await conn.query(`UPDATE customers SET ${sets.join(', ')} WHERE id = ?`, [
        ...values,
        req.params.id,
      ])
      return findCustomer(conn, req.params.id)
    })
    res.json(shape.customer(customer))
  }),
)

customersRouter.delete(
  '/:id',
  requireOwner,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id])
    if (!result.affectedRows) throw new HttpError(404, 'Customer not found.')
    res.json({ id: req.params.id })
  }),
)
