import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Minus,
  Plus,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import { VAT_RATE, categories } from '../data/api.js'
import { dateTime, money } from '../lib/format.js'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
} from '../components/ui/Primitives.jsx'
import { DataTable } from '../components/ui/DataTable.jsx'
import { ProductImage } from '../storefront/productArt.jsx'
import { Modal } from '../components/ui/Modal.jsx'

const PAYMENT_METHODS = ['Cash', 'GCash', 'Card']

export function Sales() {
  const { products, customers, sales, loading, recordSale } = useShop()
  const { user } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState('new')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [payment, setPayment] = useState({ method: 'Cash', tendered: '' })
  const [busy, setBusy] = useState(false)

  const catalogue = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!needle) return true
      return p.name.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle)
    })
  }, [products, query, category])

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0)
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100
  const total = Math.round((subtotal + vat) * 100) / 100
  const tendered = Number(payment.tendered) || 0
  const change = Math.round((tendered - total) * 100) / 100

  function addToCart(product) {
    if (product.stock === 0) return
    setCart((lines) => {
      const existing = lines.find((l) => l.productId === product.id)
      if (existing) {
        if (existing.qty >= product.stock) {
          notify('Only ' + product.stock + ' left of ' + product.name + '.', 'error')
          return lines
        }
        return lines.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [
        ...lines,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: 1,
          stock: product.stock,
        },
      ]
    })
  }

  function setQty(productId, qty) {
    const product = products.find((p) => p.id === productId)
    const capped = Math.max(1, Math.min(qty, product ? product.stock : qty))
    setCart((lines) => lines.map((l) => (l.productId === productId ? { ...l, qty: capped } : l)))
  }

  function removeLine(productId) {
    setCart((lines) => lines.filter((l) => l.productId !== productId))
  }

  function openCheckout() {
    setPayment({ method: 'Cash', tendered: String(Math.ceil(total / 100) * 100) })
    setCheckout(true)
  }

  async function completeSale(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const sale = await recordSale({
        items: cart.map(({ productId, sku, name, price, qty }) => ({
          productId,
          sku,
          name,
          price,
          qty,
        })),
        customerId: customerId || null,
        cashier: user,
        payment: { method: payment.method, tendered: payment.tendered },
      })
      setCart([])
      setCustomerId('')
      setCheckout(false)
      notify('Sale ' + sale.invoiceNo + ' recorded.')
      navigate('/sales/receipt/' + sale.id)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        tone="sales"
        icon={ShoppingCart}
        title="Sales Management"
        subtitle="Record a sale, take payment and print the receipt"
      >
        <div className="flex rounded-lg border border-line bg-white p-1">
          {[
            ['new', 'New sale'],
            ['history', 'Sales history'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={
                'rounded-md px-3 py-1.5 text-sm font-semibold transition ' +
                (tab === key ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      {tab === 'history' ? (
        <Card>
          <DataTable
            loading={loading}
            rows={sales}
            pageSize={15}
            onRowClick={(sale) => navigate('/sales/receipt/' + sale.id)}
            emptyTitle="No sales recorded yet"
            columns={[
              { key: 'invoiceNo', header: 'Invoice', sortable: true },
              {
                key: 'date',
                header: 'Date & time',
                sortable: true,
                sortValue: (s) => new Date(s.date).getTime(),
                render: (s) => dateTime(s.date),
              },
              { key: 'customerName', header: 'Customer', sortable: true },
              { key: 'cashierName', header: 'Cashier' },
              {
                key: 'method',
                header: 'Payment',
                render: (s) => <Badge tone="neutral">{s.payment.method}</Badge>,
              },
              {
                key: 'items',
                header: 'Qty',
                align: 'right',
                className: 'tnum',
                render: (s) => s.items.reduce((n, i) => n + i.qty, 0),
              },
              {
                key: 'total',
                header: 'Total',
                align: 'right',
                sortable: true,
                className: 'tnum font-semibold',
                render: (s) => money(s.total),
              },
            ]}
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          {/* Catalogue -------------------------------------------- */}
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
              <div className="relative min-w-56 flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
                />
                <Input
                  className="pl-9"
                  placeholder="Search product or scan SKU"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select
                className="w-44"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            {loading ? (
              <Spinner label="Loading products" />
            ) : catalogue.length === 0 ? (
              <EmptyState icon={Search} title="No products match" message="Try another search." />
            ) : (
              <div className="grid max-h-[34rem] gap-3 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalogue.map((product) => {
                  const out = product.stock === 0
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={out}
                      onClick={() => addToCart(product)}
                      className={
                        'rounded-card border p-3 text-left transition ' +
                        (out
                          ? 'cursor-not-allowed border-line bg-mist opacity-60'
                          : 'border-line hover:border-ink hover:bg-mist')
                      }
                    >
                      <span className="mb-2 flex h-20 items-center justify-center rounded-lg bg-mist p-2">
                        <ProductImage product={product} />
                      </span>
                      <p className="font-mono text-[10px] text-ink-3">{product.sku}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">
                        {product.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="tnum text-sm font-semibold text-ink">
                          {money(product.price)}
                        </span>
                        <span
                          className={
                            'text-xs ' +
                            (out
                              ? 'font-semibold text-bad'
                              : product.stock <= product.reorderPoint
                                ? 'font-semibold text-warn'
                                : 'text-ink-3')
                          }
                        >
                          {out ? 'Out of stock' : product.stock + ' left'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Cart -------------------------------------------------- */}
          <Card className="flex h-fit flex-col lg:sticky lg:top-20">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-bold tracking-wide text-ink uppercase">
                Current sale
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-ink-3 hover:text-bad"
                >
                  Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Cart is empty"
                message="Select a product on the left to start a sale."
              />
            ) : (
              <div className="max-h-80 divide-y divide-line/70 overflow-y-auto">
                {cart.map((line) => (
                  <div key={line.productId} className="flex gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{line.name}</p>
                      <p className="tnum text-xs text-ink-3">
                        {money(line.price)} × {line.qty} = {money(line.price * line.qty)}
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(line.productId, line.qty - 1)}
                          disabled={line.qty <= 1}
                          className="grid h-6 w-6 place-items-center rounded border border-line disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) => setQty(line.productId, Number(e.target.value))}
                          className="tnum h-6 w-12 rounded border border-line text-center text-xs"
                          aria-label="Quantity"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(line.productId, line.qty + 1)}
                          className="grid h-6 w-6 place-items-center rounded border border-line"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      className="self-start rounded p-1 text-ink-3 hover:text-bad"
                      aria-label={'Remove ' + line.name}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t border-line px-4 py-4">
              <Field label="Customer">
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Walk-in customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <dl className="tnum space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-2">
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-ink-2">
                  <dt>VAT ({Math.round(VAT_RATE * 100)}%)</dt>
                  <dd>{money(vat)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                  <dt>Total</dt>
                  <dd>{money(total)}</dd>
                </div>
              </dl>

              <Button
                tone="sales"
                size="lg"
                className="w-full"
                disabled={cart.length === 0}
                onClick={openCheckout}
              >
                Proceed to payment
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Checkout --------------------------------------------------- */}
      <Modal
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Payment"
        subtitle={cart.length + ' line item' + (cart.length === 1 ? '' : 's')}
        width="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCheckout(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              tone="sales"
              type="submit"
              form="checkout-form"
              disabled={busy || (payment.method === 'Cash' && change < 0)}
            >
              {busy ? 'Recording...' : 'Complete sale'}
            </Button>
          </>
        }
      >
        <form id="checkout-form" onSubmit={completeSale} className="space-y-4">
          <div className="rounded-lg bg-mist px-4 py-3">
            <p className="text-xs font-semibold text-ink-3 uppercase">Amount due</p>
            <p className="tnum text-2xl font-bold text-ink">{money(total)}</p>
          </div>

          <Field label="Payment method">
            <Select
              value={payment.method}
              onChange={(e) =>
                setPayment({
                  method: e.target.value,
                  tendered: e.target.value === 'Cash' ? payment.tendered : String(total),
                })
              }
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>

          {payment.method === 'Cash' && (
            <>
              <Field
                label="Cash tendered"
                required
                error={change < 0 ? 'Not enough to cover the total.' : ''}
              >
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  autoFocus
                  value={payment.tendered}
                  onChange={(e) => setPayment({ ...payment, tendered: e.target.value })}
                />
              </Field>
              <div className="flex justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                <span>Change</span>
                <span className="tnum">{money(Math.max(change, 0))}</span>
              </div>
            </>
          )}
        </form>
      </Modal>
    </>
  )
}
