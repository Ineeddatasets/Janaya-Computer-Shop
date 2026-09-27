/**
 * Row shapers: turn snake_case database rows into the exact camelCase shapes
 * the frontend already expects, so no screen has to change.
 *
 * `staff` gates commercially sensitive fields. A product's cost and supplier
 * are the shop's business; the public storefront and customer accounts get
 * price and availability only.
 */

export function product(row, { staff = false } = {}) {
  const base = {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    price: row.price,
    stock: row.stock,
    reorderPoint: row.reorder_point,
    art: row.art,
    image: row.image,
  }
  if (staff) {
    base.cost = row.cost
    base.supplierId = row.supplier_id
  }
  return base
}

export function customer(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    type: row.type,
    joined: row.joined, // already 'YYYY-MM-DD' via DATE_FORMAT in the query
  }
}

export function supplier(row) {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    supplies: row.supplies,
  }
}

export function user(row) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    title: row.title,
  }
}

/** A purchase order plus its lines. `itemRows` are the rows for this order. */
export function purchaseOrder(row, itemRows) {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    orderDate: row.order_date,
    expectedDate: row.expected_date,
    status: row.status,
    items: itemRows.map((i) => ({
      productId: i.product_id,
      qty: i.qty,
      cost: i.cost,
    })),
  }
}

/** A sale plus its lines and the nested payment object. */
export function sale(row, itemRows) {
  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    date: row.date instanceof Date ? row.date.toISOString() : row.date,
    customerId: row.customer_id,
    customerName: row.customer_name,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    items: itemRows.map((i) => ({
      productId: i.product_id,
      sku: i.sku,
      name: i.name,
      price: i.price,
      qty: i.qty,
    })),
    subtotal: row.subtotal,
    vat: row.vat,
    total: row.total,
    payment: {
      method: row.payment_method,
      tendered: row.payment_tendered,
      change: row.payment_change,
    },
  }
}
