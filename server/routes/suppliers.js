import { Router } from 'express'
import { pool, nextId, withTransaction } from '../db.js'
import { requireOwner } from '../auth.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError } from '../util.js'

/** Suppliers. The owner's module: the cashier has no supplier screen. */
export const suppliersRouter = Router()

async function findSupplier(runner, id) {
  const [rows] = await runner.query('SELECT * FROM suppliers WHERE id = ?', [id])
  if (!rows[0]) throw new HttpError(404, 'Supplier not found.')
  return rows[0]
}

suppliersRouter.get(
  '/',
  requireOwner,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name')
    res.json(rows.map(shape.supplier))
  }),
)

const FIELDS = {
  name: 'name',
  contactPerson: 'contact_person',
  phone: 'phone',
  email: 'email',
  address: 'address',
  supplies: 'supplies',
}

suppliersRouter.post(
  '/',
  requireOwner,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    if (!b.name) throw new HttpError(400, 'A company name is required.')
    const supplier = await withTransaction(async (conn) => {
      const id = await nextId(conn, 'suppliers', 'id', 'S-', 3)
      await conn.query(
        `INSERT INTO suppliers (id, name, contact_person, phone, email, address, supplies)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.name,
          b.contactPerson || '',
          b.phone || '',
          b.email || '',
          b.address || '',
          b.supplies || '',
        ],
      )
      return findSupplier(conn, id)
    })
    res.status(201).json(shape.supplier(supplier))
  }),
)

suppliersRouter.patch(
  '/:id',
  requireOwner,
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

    const supplier = await withTransaction(async (conn) => {
      await findSupplier(conn, req.params.id)
      await conn.query(`UPDATE suppliers SET ${sets.join(', ')} WHERE id = ?`, [
        ...values,
        req.params.id,
      ])
      return findSupplier(conn, req.params.id)
    })
    res.json(shape.supplier(supplier))
  }),
)

suppliersRouter.delete(
  '/:id',
  requireOwner,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id])
    if (!result.affectedRows) throw new HttpError(404, 'Supplier not found.')
    res.json({ id: req.params.id })
  }),
)
