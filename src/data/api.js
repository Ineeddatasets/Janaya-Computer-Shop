/**
 * THE SWAP POINT — now wired to the real backend.
 *
 * Every screen still reads and writes the shop's data through this module and
 * nothing else. The function names and the shapes they return are unchanged
 * from the mock, so no page or component had to change when the in-memory data
 * became a MySQL-backed API. Only the bodies below moved from array operations
 * to fetch() calls against /api.
 */

// Configuration the UI needs synchronously. The server is authoritative for
// what a sale actually charges; these copies are for display and validation.
export const VAT_RATE = 0.12
export const categories = [
  'Laptops',
  'Desktops',
  'Components',
  'Peripherals',
  'Storage',
  'Networking',
  'Accessories',
]

const BASE = '/api'

/** One fetch wrapper: sends the session cookie, parses JSON, throws {error}. */
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

const id = (value) => encodeURIComponent(value)

/* ---------------------------------------------------------------- */
/* Authentication                                                     */
/* ---------------------------------------------------------------- */

export function login(username, password) {
  return request('/auth/login', { method: 'POST', body: { username, password } })
}

/** The current session's user, or null when nobody is signed in. */
export async function me() {
  const res = await fetch(BASE + '/auth/me', { credentials: 'same-origin' })
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json()
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

/* ---------------------------------------------------------------- */
/* Products & inventory                                               */
/* ---------------------------------------------------------------- */

export const listProducts = () => request('/products')
export const createProduct = (input) => request('/products', { method: 'POST', body: input })
export const updateProduct = (productId, patch) =>
  request('/products/' + id(productId), { method: 'PATCH', body: patch })
export const deleteProduct = (productId) =>
  request('/products/' + id(productId), { method: 'DELETE' })
export const adjustStock = (productId, delta) =>
  request('/products/' + id(productId) + '/adjust', { method: 'POST', body: { delta } })

/* ---------------------------------------------------------------- */
/* Customers                                                          */
/* ---------------------------------------------------------------- */

export const listCustomers = () => request('/customers')
export const createCustomer = (input) => request('/customers', { method: 'POST', body: input })
export const updateCustomer = (customerId, patch) =>
  request('/customers/' + id(customerId), { method: 'PATCH', body: patch })
export const deleteCustomer = (customerId) =>
  request('/customers/' + id(customerId), { method: 'DELETE' })

/* ---------------------------------------------------------------- */
/* Suppliers & purchase orders                                        */
/* ---------------------------------------------------------------- */

export const listSuppliers = () => request('/suppliers')
export const createSupplier = (input) => request('/suppliers', { method: 'POST', body: input })
export const updateSupplier = (supplierId, patch) =>
  request('/suppliers/' + id(supplierId), { method: 'PATCH', body: patch })
export const deleteSupplier = (supplierId) =>
  request('/suppliers/' + id(supplierId), { method: 'DELETE' })

export const listPurchaseOrders = () => request('/purchase-orders')
export const createPurchaseOrder = (input) =>
  request('/purchase-orders', { method: 'POST', body: input })
export const setPurchaseOrderStatus = (orderId, status) =>
  request('/purchase-orders/' + id(orderId) + '/status', { method: 'POST', body: { status } })

/* ---------------------------------------------------------------- */
/* Sales                                                              */
/* ---------------------------------------------------------------- */

export const listSales = () => request('/sales')
export const getSale = (saleId) => request('/sales/' + id(saleId))

/**
 * Records a sale. The cashier comes from the session on the server, so only
 * the cart, the customer and the payment are sent; the server prices the lines,
 * checks stock and decrements it in one transaction.
 */
export const createSale = ({ items, customerId, payment }) =>
  request('/sales', { method: 'POST', body: { items, customerId, payment } })
