import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  CircleCheck,
  LayoutDashboard,
  PackageX,
  Truck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { dailySeries, inRange, totals } from '../lib/analytics.js'
import { count, dateShort, dateTime, dayKey, money, moneyRound } from '../lib/format.js'
import { Badge, Card, CardHeader, EmptyState, PageHeader, StatTile } from '../components/ui/Primitives.jsx'
import { DataTable } from '../components/ui/DataTable.jsx'
import { TrendChart } from '../components/charts/Charts.jsx'

export function Dashboard() {
  const { sales, products, lowStock, openDeliveries, purchaseOrders, supplierById, loading } =
    useShop()
  const { user } = useAuth()

  const today = dayKey(new Date())
  const monthStart = today.slice(0, 8) + '01'

  const todaySales = useMemo(() => inRange(sales, today, today), [sales, today])
  const monthSales = useMemo(() => inRange(sales, monthStart, today), [sales, monthStart, today])
  const todayTotals = totals(todaySales)
  const monthTotals = totals(monthSales)

  // Two clear weeks of context is enough to read the shape of the week.
  const trend = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 13)
    const from = dayKey(start)
    return dailySeries(inRange(sales, from, today), from, today)
  }, [sales, today])

  const outOfStock = products.filter((p) => p.stock === 0)
  const delayed = purchaseOrders.filter((o) => o.status === 'Delayed')

  const notifications = [
    ...outOfStock.map((p) => ({
      id: 'out-' + p.id,
      tone: 'critical',
      icon: PackageX,
      title: p.name + ' is out of stock',
      detail: 'Reorder point is ' + p.reorderPoint + ' units.',
      to: '/products',
    })),
    ...lowStock
      .filter((p) => p.stock > 0)
      .map((p) => ({
        id: 'low-' + p.id,
        tone: 'warning',
        icon: AlertTriangle,
        title: p.name + ' is running low',
        detail: p.stock + ' left against a reorder point of ' + p.reorderPoint + '.',
        to: '/products',
      })),
    ...delayed.map((o) => ({
      id: 'late-' + o.id,
      tone: 'warning',
      icon: Truck,
      title: o.id + ' from ' + (supplierById(o.supplierId)?.name || 'a supplier') + ' is delayed',
      detail: 'Was expected ' + dateShort(o.expectedDate) + '.',
      to: '/suppliers',
    })),
  ]

  const TONE_STYLES = {
    critical: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }

  return (
    <>
      <PageHeader
        tone="dashboard"
        icon={LayoutDashboard}
        title={'Welcome back, ' + user.name.split(' ')[0]}
        subtitle={'Store owner dashboard · ' + dateShort(new Date())}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          tone="dashboard"
          icon={Wallet}
          label="Sales today"
          value={moneyRound(todayTotals.revenue)}
          note={count(todayTotals.orders) + ' transactions'}
        />
        <StatTile
          tone="dashboard"
          icon={TrendingUp}
          label="Month to date"
          value={moneyRound(monthTotals.revenue)}
          note={count(monthTotals.units) + ' units sold'}
        />
        <StatTile
          tone="product"
          icon={Boxes}
          label="Low stock items"
          value={count(lowStock.length)}
          note={outOfStock.length + ' already out of stock'}
        />
        <StatTile
          tone="supplier"
          icon={Truck}
          label="Open deliveries"
          value={count(openDeliveries.length)}
          note={delayed.length + ' running late'}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Sales trend" subtitle="Revenue over the last 14 days" />
          <div className="p-4">
            <TrendChart data={trend} height={280} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Notifications"
            subtitle={
              notifications.length
                ? notifications.length + ' items need attention'
                : 'Everything is in order'
            }
          />
          {notifications.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="Nothing to action"
              message="Stock is above every reorder point and no delivery is late."
            />
          ) : (
            <ul className="max-h-80 divide-y divide-line/70 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="flex gap-3 px-4 py-3 hover:bg-mist">
                    <span
                      className={
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg border ' +
                        TONE_STYLES[item.tone]
                      }
                    >
                      <item.icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {item.title}
                      </span>
                      <span className="block text-xs text-ink-3">{item.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Recent sales" subtitle="The last transactions recorded at the counter" />
        <DataTable
          loading={loading}
          rows={sales.slice(0, 8)}
          emptyTitle="No sales recorded yet"
          columns={[
            { key: 'invoiceNo', header: 'Invoice' },
            { key: 'date', header: 'Date & time', render: (s) => dateTime(s.date) },
            { key: 'customerName', header: 'Customer' },
            { key: 'cashierName', header: 'Cashier' },
            {
              key: 'method',
              header: 'Payment',
              render: (s) => <Badge tone="neutral">{s.payment.method}</Badge>,
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
      </Card>
    </>
  )
}
