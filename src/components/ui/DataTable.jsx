import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react'
import { EmptyState, Spinner } from './Primitives.jsx'

/**
 * The table every list screen uses.
 *
 * columns: { key, header, align, sortable, sortValue(row), render(row), width }
 * The wrapper scrolls horizontally so a wide table never pushes the page
 * sideways on a narrow screen.
 */
export function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  onRowClick,
  loading,
  emptyTitle = 'Nothing to show',
  emptyMessage,
  initialSort,
  pageSize = 0,
}) {
  const [sort, setSort] = useState(initialSort || null)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((c) => c.key === sort.key)
    if (!column) return rows
    const value = column.sortValue || ((row) => row[column.key])
    const factor = sort.direction === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => {
      const av = value(a)
      const bv = value(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv), 'en') * factor
    })
  }, [rows, sort, columns])

  const pageCount = pageSize ? Math.ceil(sorted.length / pageSize) : 1
  const current = Math.min(page, Math.max(pageCount - 1, 0))
  const visible = pageSize ? sorted.slice(current * pageSize, current * pageSize + pageSize) : sorted

  function toggleSort(column) {
    if (!column.sortable) return
    setPage(0)
    setSort((prev) =>
      prev && prev.key === column.key
        ? { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: 'asc' },
    )
  }

  if (loading) return <Spinner />
  if (!rows.length) return <EmptyState icon={Inbox} title={emptyTitle} message={emptyMessage} />

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-line bg-mist/60 text-left">
              {columns.map((column) => {
                const active = sort && sort.key === column.key
                return (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={
                      'px-5 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-ink-3 uppercase ' +
                      (column.align === 'right' ? 'text-right ' : '') +
                      (column.align === 'center' ? 'text-center ' : '')
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={
                          'inline-flex items-center gap-1.5 hover:text-ink ' +
                          (active ? 'text-ink' : '')
                        }
                      >
                        {column.header}
                        {active ? (
                          sort.direction === 'asc' ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={
                  'transition hover:bg-mist/70 ' + (onRowClick ? 'cursor-pointer' : '')
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={
                      'px-5 py-4 align-middle text-sm text-ink-2 ' +
                      (column.align === 'right' ? 'text-right ' : '') +
                      (column.align === 'center' ? 'text-center ' : '') +
                      (column.className || '')
                    }
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && pageCount > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3.5 text-sm text-ink-3">
          <span>
            Showing {current * pageSize + 1}–{Math.min((current + 1) * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              className="rounded-full border border-line px-3.5 py-1.5 transition hover:border-ink hover:text-ink disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount - 1}
              className="rounded-full border border-line px-3.5 py-1.5 transition hover:border-ink hover:text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
