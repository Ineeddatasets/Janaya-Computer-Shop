import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { money } from '../../lib/format.js'

/**
 * Chart tokens.
 *
 * Every chart on this system plots a single measure, so one validated series
 * hue is used throughout and the module accent stays on page chrome. Status
 * colours are reserved for stock health and never stand in for a series.
 */
export const viz = {
  series: '#1c1c1e',
  seriesSoft: 'rgba(28, 28, 30, 0.08)',
  good: '#12a150',
  warning: '#b07500',
  critical: '#c02626',
  grid: '#e6e4df',
  axis: '#77756f',
}

const AXIS = {
  tick: { fill: viz.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
}

/** Shared tooltip so hover reads the same on every chart. */
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-ink">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="tnum mt-0.5 text-ink-2">
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

const compact = (value) =>
  value >= 1000 ? '₱' + Math.round(value / 1000) + 'k' : '₱' + value

/** Revenue over time. Area wash under a 2px line, no marker clutter. */
export function TrendChart({ data, xKey = 'label', yKey = 'value', height = 260, valueLabel }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={viz.grid} />
        <XAxis dataKey={xKey} {...AXIS} minTickGap={24} />
        <YAxis {...AXIS} width={54} tickFormatter={compact} />
        <Tooltip
          cursor={{ stroke: viz.axis, strokeWidth: 1 }}
          content={<ChartTooltip formatter={(v) => (valueLabel || '') + money(v)} />}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={viz.series}
          strokeWidth={2}
          strokeLinecap="round"
          fill={viz.seriesSoft}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Vertical bars for period totals. */
export function ColumnChart({ data, xKey = 'label', yKey = 'value', height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={viz.grid} />
        <XAxis dataKey={xKey} {...AXIS} />
        <YAxis {...AXIS} width={54} tickFormatter={compact} />
        <Tooltip
          cursor={{ fill: 'rgba(10, 10, 10, 0.04)' }}
          content={<ChartTooltip formatter={money} />}
        />
        <Bar dataKey={yKey} fill={viz.series} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Horizontal bars for ranked lists, where the category names are long enough
 * that vertical bars would need rotated labels.
 */
export function RankedBarChart({
  data,
  xKey = 'label',
  yKey = 'value',
  height = 300,
  colorKey,
  formatter = money,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
        barCategoryGap="22%"
      >
        <CartesianGrid horizontal={false} stroke={viz.grid} />
        <XAxis type="number" {...AXIS} tickFormatter={formatter === money ? compact : undefined} />
        <YAxis type="category" dataKey={xKey} {...AXIS} width={150} />
        <Tooltip
          cursor={{ fill: 'rgba(10, 10, 10, 0.04)' }}
          content={<ChartTooltip formatter={formatter} />}
        />
        <Bar dataKey={yKey} radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((row, index) => (
            <Cell key={index} fill={colorKey ? row[colorKey] : viz.series} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
