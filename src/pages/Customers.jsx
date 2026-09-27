import { useMemo, useState } from 'react'
import { Mail, Pencil, Phone, Plus, Receipt, Search, Trash2, Users } from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { useToast } from '../store/ToastContext.jsx'
import { count, dateShort, dateTime, money } from '../lib/format.js'
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

const BLANK = { name: '', phone: '', email: '', address: '', type: 'Walk-in' }
const TYPES = ['Walk-in', 'Regular', 'Corporate']
const TYPE_TONE = { 'Walk-in': 'neutral', Regular: 'blue', Corporate: 'purple' }

export function Customers() {
  const { customers, sales, loading, addCustomer, editCustomer, removeCustomer, salesForCustomer } =
    useShop()
  const { isOwner } = useAuth()
  const { notify } = useToast()

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  /** Lifetime spend per customer, read straight off the sales records. */
  const totals = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      if (!sale.customerId) return
      const current = map.get(sale.customerId) || { orders: 0, spend: 0, last: null }
      current.orders += 1
      current.spend += sale.total
      if (!current.last || new Date(sale.date) > new Date(current.last)) current.last = sale.date
      map.set(sale.customerId, current)
    })
    return map
  }, [sales])

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.phone.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle),
    )
  }, [customers, query])

  function openNew() {
    setForm(BLANK)
    setEditing('new')
  }

  function openEdit(customer) {
    setForm({ ...customer })
    setEditing(customer.id)
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        await addCustomer(form)
        notify(form.name + ' registered.')
      } else {
        await editCustomer(editing, form)
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
      await removeCustomer(deleting.id)
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
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (c) => (
        <div>
          <p className="font-semibold text-ink">{c.name}</p>
          <p className="text-xs text-ink-3">{c.id} · joined {dateShort(c.joined)}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (c) => (
        <div className="text-xs text-ink-2">
          <p className="flex items-center gap-1.5">
            <Phone size={12} className="text-ink-3" /> {c.phone || '—'}
          </p>
          <p className="flex items-center gap-1.5">
            <Mail size={12} className="text-ink-3" /> {c.email || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (c) => <Badge tone={TYPE_TONE[c.type]}>{c.type}</Badge>,
    },
    {
      key: 'orders',
      header: 'Purchases',
      align: 'right',
      sortable: true,
      sortValue: (c) => totals.get(c.id)?.orders || 0,
      className: 'tnum',
      render: (c) => totals.get(c.id)?.orders || 0,
    },
    {
      key: 'spend',
      header: 'Total spent',
      align: 'right',
      sortable: true,
      sortValue: (c) => totals.get(c.id)?.spend || 0,
      className: 'tnum',
      render: (c) => money(totals.get(c.id)?.spend || 0),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" title="Purchase history" onClick={() => setViewing(c)}>
            <Receipt size={15} />
          </Button>
          <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(c)}>
            <Pencil size={15} />
          </Button>
          {isOwner && (
            <Button size="sm" variant="ghost" title="Delete" onClick={() => setDeleting(c)}>
              <Trash2 size={15} className="text-bad" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const history = viewing ? salesForCustomer(viewing.id) : []
  const historyTotal = history.reduce((sum, s) => sum + s.total, 0)

  return (
    <>
      <PageHeader
        tone="customer"
        icon={Users}
        title="Customer Management"
        subtitle={`${count(customers.length)} registered customers`}
      >
        <Button tone="customer" onClick={openNew}>
          <Plus size={16} /> Register customer
        </Button>
      </PageHeader>

      <Card>
        <div className="border-b border-line px-4 py-3">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
            />
            <Input
              className="pl-9"
              placeholder="Search name, phone or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          initialSort={{ key: 'name', direction: 'asc' }}
          onRowClick={setViewing}
          emptyTitle="No customers match"
          emptyMessage="Try a different name, phone number or email."
        />
      </Card>

      {/* Add / edit ------------------------------------------------ */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Register customer' : 'Edit customer'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button tone="customer" form="customer-form" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save customer'}
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name or business name" required>
              <Input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0917 000 0000"
            />
          </Field>
          <Field label="Customer type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
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
        </form>
      </Modal>

      {/* Purchase history ------------------------------------------ */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? viewing.name : ''}
        subtitle={viewing ? `${viewing.type} · ${viewing.phone || 'no phone on file'}` : ''}
        width="lg"
        footer={
          <Button variant="ghost" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-mist px-4 py-3">
            <p className="text-xs font-semibold text-ink-3 uppercase">Purchases</p>
            <p className="tnum text-lg font-bold text-ink">{history.length}</p>
          </div>
          <div className="rounded-lg bg-mist px-4 py-3">
            <p className="text-xs font-semibold text-ink-3 uppercase">Total spent</p>
            <p className="tnum text-lg font-bold text-ink">{money(historyTotal)}</p>
          </div>
          <div className="rounded-lg bg-mist px-4 py-3">
            <p className="text-xs font-semibold text-ink-3 uppercase">Last purchase</p>
            <p className="text-lg font-bold text-ink">
              {history.length ? dateShort(history[0].date) : '—'}
            </p>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg border border-line">
          <DataTable
            rows={history}
            emptyTitle="No purchases yet"
            emptyMessage="Sales recorded against this customer will appear here."
            columns={[
              { key: 'invoiceNo', header: 'Invoice' },
              { key: 'date', header: 'Date', render: (s) => dateTime(s.date) },
              {
                key: 'items',
                header: 'Items',
                render: (s) => s.items.reduce((n, i) => n + i.qty, 0),
                align: 'right',
              },
              {
                key: 'total',
                header: 'Total',
                align: 'right',
                className: 'tnum font-semibold',
                render: (s) => money(s.total),
              },
            ]}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete this customer?"
        message={
          deleting
            ? `${deleting.name} will be removed. Past sales stay in the records but will no longer be linked to a customer.`
            : ''
        }
      />
    </>
  )
}
