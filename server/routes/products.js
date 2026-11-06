import { Router } from 'express'
import { pool, nextId, withTransaction } from '../db.js'
import { requireOwner, isStaff } from '../auth.js'
import * as shape from '../serialize.js'
import { asyncHandler, HttpError } from '../util.js'

/**
 * Products & inventory.
 *
 * The list is public so the storefront can render it, but cost and supplier are
 * stripped for anyone who is not staff (see serialize.product). Every write is
 * the owner's: the cashier sells stock but does not manage it.
 */
export const productsRouter = Router()

/**
 * The picture may be left empty, point at an https URL, or carry an uploaded
 * photo inline as a data URL. The browser already shrinks uploads, but the
 * server is the one that has to be sure: an oversized row would eat the
 * database's small storage budget, and the column itself has a ceiling.
 */
const MAX_IMAGE_BYTES = 200 * 1024

function cleanImage(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null

  if (typeof value !== 'string') throw new HttpError(400, 'That photo could not be read.')

  if (/^https:\/\//i.test(value)) {
    if (value.length > 2048) throw new HttpError(400, 'That image link is too long.')
    return value
  }

  if (/^data:image\/(jpeg|png|webp|avif);base64,/i.test(value)) {
    if (value.length > MAX_IMAGE_BYTES) {
      throw new HttpError(400, 'That photo is too large. Please choose a smaller one.')
    }
    return value
  }

  throw new HttpError(400, 'A photo must be an uploaded image or an https link.')
}

async function findProduct(runner, id) {
  const [rows] = await runner.query('SELECT * FROM products WHERE id = ?', [id])
  if (!rows[0]) throw new HttpError(404, 'Product not found.')
  return rows[0]
}

// Public read, shaped by role.
productsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id')
    const staff = isStaff(req.user)
    res.json(rows.map((r) => shape.product(r, { staff })))
  }),
)

productsRouter.post(
  '/',
  requireOwner,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    if (!b.sku || !b.name || !b.category) {
      throw new HttpError(400, 'SKU, name and category are required.')
    }
    const product = await withTransaction(async (conn) => {
      const id = await nextId(conn, 'products', 'id', 'P-', 3)
      await conn.query(
        `INSERT INTO products
           (id, sku, name, category, supplier_id, cost, price, stock, reorder_point, art, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          b.sku,
          b.name,
          b.category,
          b.supplierId || null,
          Number(b.cost) || 0,
          Number(b.price) || 0,
          Number(b.stock) || 0,
          Number(b.reorderPoint) || 0,
          b.art || 'tower',
          cleanImage(b.image) ?? null,
        ],
      )
      return findProduct(conn, id)
    })
    res.status(201).json(shape.product(product, { staff: true }))
  }),
)

const EDITABLE = {
  sku: 'sku',
  name: 'name',
  category: 'category',
  supplierId: 'supplier_id',
  cost: 'cost',
  price: 'price',
  stock: 'stock',
  reorderPoint: 'reorder_point',
  art: 'art',
  image: 'image',
}
const NUMERIC = new Set(['cost', 'price', 'stock', 'reorderPoint'])

productsRouter.patch(
  '/:id',
  requireOwner,
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    const sets = []
    const values = []
    for (const [key, column] of Object.entries(EDITABLE)) {
      if (b[key] === undefined) continue
      sets.push(`${column} = ?`)
      if (key === 'image') values.push(cleanImage(b[key]) ?? null)
      else if (NUMERIC.has(key)) values.push(Number(b[key]) || 0)
      else if (key === 'supplierId') values.push(b[key] || null)
      else values.push(b[key])
    }
    if (!sets.length) throw new HttpError(400, 'Nothing to update.')

    const product = await withTransaction(async (conn) => {
      await findProduct(conn, req.params.id)
      await conn.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, [
        ...values,
        req.params.id,
      ])
      return findProduct(conn, req.params.id)
    })
    res.json(shape.product(product, { staff: true }))
  }),
)

// Positive delta receives stock, negative writes it off. Never below zero.
productsRouter.post(
  '/:id/adjust',
  requireOwner,
  asyncHandler(async (req, res) => {
    const delta = Number(req.body?.delta)
    if (!Number.isFinite(delta)) throw new HttpError(400, 'A numeric change is required.')

    const product = await withTransaction(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
        req.params.id,
      ])
      if (!rows[0]) throw new HttpError(404, 'Product not found.')
      const next = rows[0].stock + delta
      if (next < 0) throw new HttpError(400, 'Stock cannot go below zero.')
      await conn.query('UPDATE products SET stock = ? WHERE id = ?', [next, req.params.id])
      return findProduct(conn, req.params.id)
    })
    res.json(shape.product(product, { staff: true }))
  }),
)

productsRouter.delete(
  '/:id',
  requireOwner,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
    if (!result.affectedRows) throw new HttpError(404, 'Product not found.')
    res.json({ id: req.params.id })
  }),
)
