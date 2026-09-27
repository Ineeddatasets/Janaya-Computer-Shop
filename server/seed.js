import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool, withTransaction } from './db.js'

/**
 * Seeds the database from the same data the frontend shipped with, so a fresh
 * install shows the exact catalogue, customers, suppliers and four months of
 * sales history the app was demonstrated with. Passwords are hashed here; the
 * source file keeps them in plain text only for the demo login hints.
 *
 * Idempotent: it clears the tables first, so re-running gives a clean seed.
 */
const seed = await import('../src/data/seed.js')

const passwordHashes = Object.fromEntries(
  await Promise.all(
    seed.users.map(async (u) => [u.id, await bcrypt.hash(u.password, 10)]),
  ),
)

// DATETIME wants a Date; DATE columns take the 'YYYY-MM-DD' strings as-is.
const asDateTime = (iso) => new Date(iso)

await withTransaction(async (conn) => {
  // Clear in reverse dependency order so foreign keys never complain.
  for (const table of [
    'sale_items',
    'sales',
    'purchase_order_items',
    'purchase_orders',
    'products',
    'users',
    'suppliers',
    'customers',
  ]) {
    await conn.query(`DELETE FROM ${table}`)
  }

  await conn.query(
    'INSERT INTO customers (id, name, phone, email, address, type, joined) VALUES ?',
    [seed.customers.map((c) => [c.id, c.name, c.phone, c.email, c.address, c.type, c.joined])],
  )

  await conn.query(
    'INSERT INTO users (id, username, password_hash, name, role, title) VALUES ?',
    [seed.users.map((u) => [u.id, u.username, passwordHashes[u.id], u.name, u.role, u.title])],
  )

  await conn.query(
    'INSERT INTO suppliers (id, name, contact_person, phone, email, address, supplies) VALUES ?',
    [
      seed.suppliers.map((s) => [
        s.id,
        s.name,
        s.contactPerson,
        s.phone,
        s.email,
        s.address,
        s.supplies,
      ]),
    ],
  )

  await conn.query(
    `INSERT INTO products
       (id, sku, name, category, supplier_id, cost, price, stock, reorder_point, art, image)
     VALUES ?`,
    [
      seed.products.map((p) => [
        p.id,
        p.sku,
        p.name,
        p.category,
        p.supplierId || null,
        p.cost,
        p.price,
        p.stock,
        p.reorderPoint,
        p.art || 'tower',
        p.image || null,
      ]),
    ],
  )

  await conn.query(
    'INSERT INTO purchase_orders (id, supplier_id, order_date, expected_date, status) VALUES ?',
    [
      seed.purchaseOrders.map((o) => [
        o.id,
        o.supplierId || null,
        o.orderDate,
        o.expectedDate || null,
        o.status,
      ]),
    ],
  )
  const poItems = seed.purchaseOrders.flatMap((o) =>
    o.items.map((line) => [o.id, line.productId, line.qty, line.cost]),
  )
  if (poItems.length) {
    await conn.query(
      'INSERT INTO purchase_order_items (po_id, product_id, qty, cost) VALUES ?',
      [poItems],
    )
  }

  await conn.query(
    `INSERT INTO sales
       (id, invoice_no, date, customer_id, customer_name, cashier_id, cashier_name,
        subtotal, vat, total, payment_method, payment_tendered, payment_change)
     VALUES ?`,
    [
      seed.sales.map((s) => [
        s.id,
        s.invoiceNo,
        asDateTime(s.date),
        s.customerId || null,
        s.customerName,
        s.cashierId || null,
        s.cashierName,
        s.subtotal,
        s.vat,
        s.total,
        s.payment.method,
        s.payment.tendered,
        s.payment.change,
      ]),
    ],
  )
  const saleItems = seed.sales.flatMap((s) =>
    s.items.map((line) => [s.id, line.productId, line.sku, line.name, line.price, line.qty]),
  )
  if (saleItems.length) {
    await conn.query(
      'INSERT INTO sale_items (sale_id, product_id, sku, name, price, qty) VALUES ?',
      [saleItems],
    )
  }

  console.log(
    `✓ Seeded: ${seed.users.length} users, ${seed.customers.length} customers, ` +
      `${seed.suppliers.length} suppliers, ${seed.products.length} products, ` +
      `${seed.purchaseOrders.length} purchase orders, ${seed.sales.length} sales.`,
  )
})

await pool.end()
