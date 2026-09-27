import { useMemo, useState } from 'react'
import { BarChart3, Boxes, CalendarDays, Printer, TrendingUp, Trophy } from 'lucide-react'
import { useShop } from '../store/ShopContext.jsx'
import {
  bestSellers,
  dailySeries,
  defaultRange,
  inRange,
  inventorySummary,
  monthlySeries,
  totals,
} from '../lib/analytics.js'
import { count, money, moneyRound } from '../lib/format.js'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  PageHeader,
  StatTile,
} from '../components/ui/Primitives.jsx'
import { DataTable } from '../components/ui/DataTable.jsx'
import { ColumnChart, RankedBarChart, TrendChart } from '../components/charts/Charts.jsx'

const TABS = [
  { key: 'daily', label: 'Daily sales', icon: CalendarDays },
  { key: 'monthly', label: 'Monthly sales', icon: TrendingUp },
  { key: 'inventory', label: 'Inventory', icon: Boxes },
  { key: 'best', label: 'Best sellers', icon: Trophy },
]

export function Reports() {
  const { sales, products, loading } = useShop()
  const [tab, setTab] = useState('daily')
  const [range, setRange] = useState(defaultRange())

  const scoped = useMemo(() => inRange(sales, range.from, range.to), [sales, range])
  const summary = useMemo(() => totals(scoped), [scoped])
  const daily = useMemo(() => dailySeries(scoped, range.from, range.to), [scoped, range])
  const monthly = useMemo(() => monthlySeries(sales), [sales])
  const top = useMemo(() => bestSellers(scoped), [scoped])
  const stock = useMemo(() => inventorySummary(products), [products])


  return (
    <>
      <PageHeader
        tone="report"
        icon={BarChart3}
        title="Reports & Analytics"
        subtitle="Figures are drawn from the same sales and inventory records the shop floor uses"
      >
        <Button variant="outline" tone="report" onClick={() => window.print()}>
          <Printer size={16} /> Print report
        </Button>
      </PageHeader>

      {/* Range and tabs ------------------------------------------- */}
      <div className="no-print mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex overflow-x-auto rounded-lg border border-line bg-white p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={
                'flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition ' +
                (tab === item.key
                  ? 'bg-ink text-white'
                  : 'text-ink-3 hover:text-ink')
              }
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </div>

        {tab !== 'inventory' && tab !== 'monthly' && (
          <div className="flex items-end gap-2">
            <label className="text-xs font-semibold text-ink-2 uppercase">
              <span className="mb-1 block">From</span>
              <Input
                type="date"
                value={range.from}
                max={range.to}
                onChange={(e) => setRange({ ...range, from: e.target.value })}
              />
            </label>
            <label className="text-xs font-semibold text-ink-2 uppercase">
              <span className="mb-1 block">To</span>
              <Input
                type="date"
                value={range.to}
                min={range.from}
                onChange={(e) => setRange({ ...range, to: e.target.value })}
              />
            </label>
          </div>
        )}
      </div>

      {/* Headline figures for the selected range ------------------- */}
      {tab !== 'inventory' && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile tone="report" label="Revenue" value={moneyRound(summary.revenue)} />
          <StatTile tone="report" label="Transactions" value={count(summary.orders)} />
          <StatTile tone="report" label="Units sold" value={count(summary.units)} />
          <StatTile tone="report" label="Average sale" value={moneyRound(summary.average)} />
        </div>
      )}

      {tab === 'daily' && (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader
              title="Daily sales revenue"
              subtitle={`${daily.length} days from ${range.from} to ${range.to}`}
            />
            <div className="p-4">
              <TrendChart data={daily} height={300} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Day by day" subtitle="Newest first" />
            <DataTable
              loading={loading}
              rows={[...daily].reverse()}
              rowKey={(row) => row.key}
              pageSize={10}
              emptyTitle="No days in range"
              columns={[
                { key: 'label', header: 'Date' },
                { key: 'orders', header: 'Sales', align: 'right', className: 'tnum' },
                {
                  key: 'value',
                  header: 'Revenue',
                  align: 'right',
                  className: 'tnum font-semibold',
                  render: (row) => money(row.value),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'monthly' && (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader
              title="Monthly sales revenue"
              subtitle="Every month held in the sales records"
            />
            <div className="p-4">
              <ColumnChart data={monthly} height={300} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Month by month" />
            <DataTable
              loading={loading}
              rows={[...monthly].reverse()}
              rowKey={(row) => row.key}
              emptyTitle="No sales recorded"
              columns={[
                { key: 'label', header: 'Month' },
                { key: 'orders', header: 'Sales', align: 'right', className: 'tnum' },
                {
                  key: 'value',
                  header: 'Revenue',
                  align: 'right',
                  className: 'tnum font-semibold',
                  render: (row) => money(row.value),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'inventory' && (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile tone="report" label="Products" value={count(stock.skuCount)} />
            <StatTile tone="report" label="Units on hand" value={count(stock.units)} />
            <StatTile tone="report" label="Stock at cost" value={moneyRound(stock.costValue)} />
            <StatTile
              tone="report"
              label="Stock at retail"
              value={moneyRound(stock.retailValue)}
              note={`${stock.low.length} low · ${stock.out.length} out of stock`}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader title="Stock value by category" subtitle="Valued at cost price" />
              <div className="p-4">
                <RankedBarChart data={stock.byCategory} height={300} />
              </div>
            </Card>
            <Card>
              <CardHeader
                title="Items needing attention"
                subtitle="At or below the reorder point"
              />
              <DataTable
                loading={loading}
                rows={[...stock.out, ...stock.low]}
                pageSize={10}
                emptyTitle="Every product is above its reorder point"
                columns={[
                  {
                    key: 'name',
                    header: 'Product',
                    render: (p) => (
                      <div>
                        <p className="font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-ink-3">{p.category}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'stock',
                    header: 'On hand',
                    align: 'right',
                    className: 'tnum',
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (p) =>
                      p.stock === 0 ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : (
                        <Badge tone="amber">Reorder</Badge>
                      ),
                  },
                ]}
              />
            </Card>
          </div>
        </>
      )}

      {tab === 'best' && (
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader
              title="Best selling products"
              subtitle="By units sold in the selected range"
            />
            <div className="p-4">
              <RankedBarChart
                data={top.map((row) => ({
                  label: row.name.length > 24 ? row.name.slice(0, 22) + '…' : row.name,
                  value: row.qty,
                }))}
                height={320}
                formatter={(v) => v + ' units'}
              />
            </div>
          </Card>
          <Card>
            <CardHeader title="Ranked list" subtitle="Units and the revenue they brought in" />
            <DataTable
              loading={loading}
              rows={top}
              rowKey={(row) => row.productId}
              emptyTitle="No sales in this range"
              columns={[
                {
                  key: 'name',
                  header: 'Product',
                  render: (row) => (
                    <div>
                      <p className="font-semibold text-ink">{row.name}</p>
                      <p className="font-mono text-xs text-ink-3">{row.sku}</p>
                    </div>
                  ),
                },
                { key: 'qty', header: 'Units', align: 'right', className: 'tnum' },
                {
                  key: 'revenue',
                  header: 'Revenue',
                  align: 'right',
                  className: 'tnum font-semibold',
                  render: (row) => money(row.revenue),
                },
              ]}
            />
          </Card>
        </div>
      )}
    </>
  )
}
