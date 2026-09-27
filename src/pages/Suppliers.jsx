import { useMemo, useState } from 'react'
import { Mail, Pencil, Phone, Plus, Trash2, Truck } from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import { dateShort, money } from '../lib/format.js'
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../components/ui/Primitives.jsx'
import { DataTable } from '../components/ui/DataTable.jsx'
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx'

const BLANK_SUPPLIER = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  supplies: '',
}

const STATUS_TONE = {
  Delivered: 'green',
  'In Transit': 'blue',
  Pending: 'amber',
  Delayed: 'red',
  Cancelled: 'neutral',
}

const STATUSES = ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled']

export function Suppliers() {
  const {
    suppliers,
    purchaseOrders,
    products,
    loading,
    addSupplier,
    editSupplier,
    removeSupplier,
    addPurchaseOrder,
    setOrderStatus,
    supplierById,
    productById,
  } = useShop()
  const { isOwner } = useAuth()
  const { notify } = useToast()

  const [tab, setTab] = useState('suppliers')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_SUPPLIER)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const [orderOpen, setOrderOpen] = useState(false)
  const [order, setOrder] = useState({ supplierId: '', expectedDate: '', productId: '', qty: '1' })

  const orderRows = useMemo(
    () =>
      [...purchaseOrders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
    [purchaseOrders],
  )

  function orderValue(po) {
    return po.items.reduce((sum, line) => sum + line.cost * line.qty, 0)
  }

  function openNewSupplier() {
    setForm(BLANK_SUPPLIER)
    setEditing('new')
  }

  async function saveSupplier(event) {
    event.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        await addSupplier(form)
        notify(form.name + ' added.')
      } else {
        await editSupplier(editing, form)
        notify(form.name + ' updated.')
      }
      setEditing(null)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setBusy(true)
    try {
      await removeSupplier(deleting.id)
      notify(deleting.name + ' removed.')
      setDeleting(null)
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(po, status) {
    try {
      await setOrderStatus(po.id, status)
      notify(
        status === 'Delivered'
          ? po.id + ' received. Stock has been updated.'
          : po.id + ' marked as ' + status.toLowerCase() + '.',
      )
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  async function saveOrder(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const product = productById(order.productId)
      await addPurchaseOrder({
        supplierId: order.supplierId,
        expectedDate: order.expectedDate,
        items: [{ productId: product.id, qty: Number(order.qty), cost: product.cost }],
      })
      notify('Purchase order raised with ' + supplierById(order.supplierId).name + '.')
      setOrderOpen(false)
      setOrder({ supplierId: '', expectedDate: '', productId: '', qty: '1' })
      setTab('orders')
    } catch (err) {
      notify(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const supplierColumns = [
    {
      key: 'name',
      header: 'Supplier',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-semibold text-ink">{s.name}</p>
          <p className="text-xs text-ink-3">{s.address}</p>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact person',
      sortable: true,
      render: (s) => (
        <div className="text-xs text-ink-2">
          <p className="font-semibold text-ink-2">{s.contactPerson}</p>
          <p className="flex items-center gap-1.5">
            <Phone size={12} className="text-ink-3" /> {s.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail size={12} className="text-ink-3" /> {s.email}
          </p>
        </div>
      ),
    },
    { key: 'supplies', header: 'Supplies' },
    {
      key: 'items',
      header: 'Products',
      align: 'right',
      className: 'tnum',
      sortable: true,
      sortValue: (s) => products.filter((p) => p.supplierId === s.id).length,
      render: (s) => products.filter((p) => p.supplierId === s.id).length,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Edit"
            onClick={() => {
              setForm({ ...s })
              setEditing(s.id)
            }}
          >
            <Pencil size={15} />
          </Button>
          {isOwner && (
            <Button size="sm" variant="ghost" title="Delete" onClick={() => setDeleting(s)}>
              <Trash2 size={15} className="text-bad" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const orderColumns = [
    { key: 'id', header: 'PO number', sortable: true },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
      sortValue: (po) => supplierById(po.supplierId)?.name || '',
      render: (po) => supplierById(po.supplierId)?.name || 'Unknown supplier',
    },
    {
      key: 'orderDate',
      header: 'Ordered',
      sortable: true,
      render: (po) => dateShort(po.orderDate),
    },
    {
      key: 'expectedDate',
      header: 'Expected',
      sortable: true,
      render: (po) => dateShort(po.expectedDate),
    },
    {
      key: 'lines',
      header: 'Items',
      render: (po) => (
        <ul className="text-xs text-ink-2">
          {po.items.map((line) => (
            <li key={line.productId}>
              {line.qty} × {productById(line.productId)?.name || line.productId}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'value',
      header: 'Order value',
      align: 'right',
      className: 'tnum',
      sortable: true,
      sortValue: orderValue,
      render: (po) => money(orderValue(po)),
    },
    {
      key: 'status',
      header: 'Delivery status',
      sortable: true,
      render: (po) => <Badge tone={STATUS_TONE[po.status]}>{po.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (po) => (
        <Select
          className="w-36 text-xs"
          value={po.status}
          onChange={(e) => changeStatus(po, e.target.value)}
          aria-label={'Change status of ' + po.id}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        tone="supplier"
        icon={Truck}
        title="Supplier Management"
        subtitle={`${suppliers.length} suppliers · ${orderRows.filter((o) => o.status !== 'Delivered').length} open purchase orders`}
      >
        <div className="flex rounded-lg border border-line bg-white p-1">
          {[
            ['suppliers', 'Suppliers'],
            ['orders', 'Purchase orders'],
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
        {tab === 'suppliers' ? (
          <Button tone="supplier" onClick={openNewSupplier}>
            <Plus size={16} /> Add supplier
          </Button>
        ) : (
          <Button tone="supplier" onClick={() => setOrderOpen(true)}>
            <Plus size={16} /> New purchase order
          </Button>
        )}
      </PageHeader>

      <Card>
        {tab === 'suppliers' ? (
          <DataTable
            columns={supplierColumns}
            rows={suppliers}
            loading={loading}
            initialSort={{ key: 'name', direction: 'asc' }}
            emptyTitle="No suppliers yet"
            emptyMessage="Add the shops and distributors you buy stock from."
          />
        ) : (
          <DataTable
            columns={orderColumns}
            rows={orderRows}
            loading={loading}
            emptyTitle="No purchase orders"
            emptyMessage="Raise an order to restock from a supplier."
          />
        )}
      </Card>

      {/* Supplier form --------------------------------------------- */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add supplier' : 'Edit supplier'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button tone="supplier" form="supplier-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save supplier'}
            </Button>
          </>
        }
      >
        <form id="supplier-form" onSubmit={saveSupplier} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Company name" required>
              <Input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Contact person">
            <Input
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Product lines supplied" hint="Comma separated, e.g. Laptops, Desktops">
              <Input
                value={form.supplies}
                onChange={(e) => setForm({ ...form, supplies: e.target.value })}
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Purchase order form --------------------------------------- */}
      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="New purchase order"
        subtitle="Marking the order delivered later will raise stock automatically."
        width="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOrderOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button tone="supplier" form="order-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Raise order'}
            </Button>
          </>
        }
      >
        <form id="order-form" onSubmit={saveOrder} className="space-y-4">
          <Field label="Supplier" required>
            <Select
              required
              value={order.supplierId}
              onChange={(e) => setOrder({ ...order, supplierId: e.target.value, productId: '' })}
            >
              <option value="">Choose a supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Product" required>
            <Select
              required
              value={order.productId}
              onChange={(e) => setOrder({ ...order, productId: e.target.value })}
              disabled={!order.supplierId}
            >
              <option value="">
                {order.supplierId ? 'Choose a product' : 'Choose a supplier first'}
              </option>
              {products
                .filter((p) => !order.supplierId || p.supplierId === order.supplierId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.stock} in stock
                  </option>
                ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quantity" required>
              <Input
                required
                type="number"
                min="1"
                value={order.qty}
                onChange={(e) => setOrder({ ...order, qty: e.target.value })}
              />
            </Field>
            <Field label="Expected delivery" required>
              <Input
                required
                type="date"
                value={order.expectedDate}
                onChange={(e) => setOrder({ ...order, expectedDate: e.target.value })}
              />
            </Field>
          </div>

          {order.productId && (
            <p className="rounded-lg bg-mist px-4 py-3 text-sm text-ink-2">
              Order value:{' '}
              <strong className="tnum">
                {money((productById(order.productId)?.cost || 0) * Number(order.qty || 0))}
              </strong>
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete this supplier?"
        message={
          deleting
            ? `${deleting.name} will be removed. Products linked to them keep their records but lose the supplier reference.`
            : ''
        }
      />
    </>
  )
}
