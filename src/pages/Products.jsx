import { useMemo, useState } from 'react'
import { AlertTriangle, Package, PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import { categories } from '../data/api.js'
import { money, count } from '../lib/format.js'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
} from '../components/ui/Primitives.jsx'
import { DataTable } from '../components/ui/DataTable.jsx'
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx'
import { ProductImage } from '../storefront/productArt.jsx'

const BLANK = {
  sku: '',
  name: '',
  category: 'Components',
  supplierId: '',
  cost: '',
  price: '',
  stock: '',
  reorderPoint: '',
}

export function Products() {
  const { products, suppliers, lowStock, loading, addProduct, editProduct, removeProduct, changeStock } =
    useShop()
  const { isOwner } = useAuth()
  const { notify } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [onlyLow, setOnlyLow] = useState(false)

  const [editing, setEditing] = useState(null) // product being edited, or BLANK for new
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const [adjusting, setAdjusting] = useState(null)
  const [adjustBy, setAdjustBy] = useState('')

  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (onlyLow && p.stock > p.reorderPoint) return false
      if (!needle) return true
      return (
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle)
      )
    })
  }, [products, query, category, onlyLow])

  const stockValue = useMemo(
    () => products.reduce((sum, p) => sum + p.cost * p.stock, 0),
    [products],
  )

  function openNew() {
    setForm(BLANK)
    setEditing('new')
  }

  function openEdit(product) {
    setForm({ ...product })
    setEditing(product.id)
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        await addProduct(form)
        notify(form.name + ' added to inventory.')
      } else {
        await editProduct(editing, form)
        notify(form.name + ' updated.')
      }
      setEditing(null)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function applyAdjustment(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const updated = await changeStock(adjusting.id, Number(adjustBy))
      notify(adjusting.name + ' now at ' + updated.stock + ' in stock.')
      setAdjusting(null)
      setAdjustBy('')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    setBusy(true)
    try {
      await removeProduct(deleting.id)
      notify(deleting.name + ' removed.')
      setDeleting(null)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      render: (p) => <span className="font-mono text-xs text-ink-3">{p.sku}</span>,
    },
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="h-10 w-14 shrink-0 rounded-lg bg-mist p-1">
            <ProductImage product={p} />
          </span>
          <span>
            <span className="block font-semibold text-ink">{p.name}</span>
            <span className="block text-xs text-ink-3">{p.category}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Selling price',
      align: 'right',
      sortable: true,
      className: 'tnum',
      render: (p) => money(p.price),
    },
    {
      key: 'stock',
      header: 'In stock',
      align: 'right',
      sortable: true,
      className: 'tnum',
      render: (p) => (
        <span className={p.stock <= p.reorderPoint ? 'font-bold text-warn' : ''}>
          {p.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.stock - p.reorderPoint,
      sortable: true,
      render: (p) =>
        p.stock === 0 ? (
          <Badge tone="red">Out of stock</Badge>
        ) : p.stock <= p.reorderPoint ? (
          <Badge tone="amber">Low stock</Badge>
        ) : (
          <Badge tone="green">In stock</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Adjust stock"
            onClick={() => {
              setAdjusting(p)
              setAdjustBy('')
            }}
          >
            <PackagePlus size={15} />
          </Button>
          <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(p)}>
            <Pencil size={15} />
          </Button>
          {isOwner && (
            <Button size="sm" variant="ghost" title="Delete" onClick={() => setDeleting(p)}>
              <Trash2 size={15} className="text-bad" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        tone="product"
        icon={Package}
        title="Product & Inventory Management"
        subtitle={`${count(products.length)} products · ${money(stockValue)} at cost`}
      >
        <Button tone="product" onClick={openNew}>
          <Plus size={16} /> Add product
        </Button>
      </PageHeader>

      {lowStock.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="flex-1">
            <strong>{lowStock.length}</strong> product{lowStock.length === 1 ? '' : 's'} at or below
            the reorder point: {lowStock.slice(0, 3).map((p) => p.name).join(', ')}
            {lowStock.length > 3 && ` and ${lowStock.length - 3} more`}.
          </span>
          <Button size="sm" variant="outline" tone="product" onClick={() => setOnlyLow(true)}>
            Show only these
          </Button>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <div className="relative min-w-56 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
            />
            <Input
              className="pl-9"
              placeholder="Search by name, SKU or category"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            className="w-48"
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
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
            />
            Low stock only
          </label>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          initialSort={{ key: 'name', direction: 'asc' }}
          emptyTitle="No products match"
          emptyMessage="Adjust the search or category filter."
        />
      </Card>

      {/* Add / edit ------------------------------------------------ */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add product' : 'Edit product'}
        subtitle="Stock changes made here overwrite the current count."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button tone="product" form="product-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save product'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU" required>
            <Input
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="CMP-RAM-16K"
            />
          </Field>
          <Field label="Category" required>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Product name" required>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kingston Fury 16GB DDR4 3200"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Supplier">
              <Select
                value={form.supplierId || ''}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              >
                <option value="">Not assigned</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Cost price" required>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </Field>
          <Field label="Selling price" required>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field label="Quantity in stock" required>
            <Input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </Field>
          <Field label="Reorder point" hint="A low stock alert fires at or below this number.">
            <Input
              type="number"
              min="0"
              value={form.reorderPoint}
              onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })}
            />
          </Field>
        </form>
      </Modal>

      {/* Stock adjustment ------------------------------------------ */}
      <Modal
        open={Boolean(adjusting)}
        onClose={() => setAdjusting(null)}
        title="Adjust stock"
        subtitle={adjusting ? `${adjusting.name} — ${adjusting.stock} on hand` : ''}
        width="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdjusting(null)} disabled={busy}>
              Cancel
            </Button>
            <Button tone="product" form="adjust-form" type="submit" disabled={busy || !adjustBy}>
              {busy ? 'Applying...' : 'Apply'}
            </Button>
          </>
        }
      >
        <form id="adjust-form" onSubmit={applyAdjustment} className="space-y-4">
          <Field
            label="Change by"
            hint="Positive to receive stock, negative to write it off."
            required
          >
            <Input
              required
              type="number"
              autoFocus
              placeholder="e.g. 10 or -2"
              value={adjustBy}
              onChange={(e) => setAdjustBy(e.target.value)}
            />
          </Field>
          {adjusting && adjustBy !== '' && (
            <p className="text-sm text-ink-2">
              New quantity:{' '}
              <strong className="tnum">{adjusting.stock + Number(adjustBy)}</strong>
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete this product?"
        message={
          deleting
            ? `${deleting.name} will be removed from inventory. Past sales that include it are not affected.`
            : ''
        }
      />
    </>
  )
}
