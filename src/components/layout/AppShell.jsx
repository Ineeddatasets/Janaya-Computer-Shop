import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AlertTriangle, Bell, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../store/AuthContext.jsx'
import { useShop } from '../../store/ShopContext.jsx'
import { navigationFor } from '../../lib/nav.js'
import { initials } from '../../lib/format.js'
import { Mark } from '../../storefront/art.jsx'

/**
 * The staff shell.
 *
 * Same design language as the storefront: white surfaces on warm off-white,
 * hairline rules, near-black ink. The sidebar used to be navy with a colour
 * per module; both are gone, so the only colour on screen is a stock or
 * delivery warning that genuinely needs attention.
 */
export function AppShell() {
  const { user, signOut, isOwner } = useAuth()
  const { lowStock, openDeliveries } = useShop()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const items = navigationFor(user.role)
  const alerts = lowStock.length + openDeliveries.filter((o) => o.status === 'Delayed').length

  // Tapping a link on a phone should close the drawer behind it.
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="flex min-h-screen">
      {menuOpen && (
        <div
          className="no-print fixed inset-0 z-20 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={
          // Off-canvas drawer on small screens, pinned full-height column from lg up.
          'no-print fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-line bg-white transition-transform ' +
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ' +
          (menuOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex items-center gap-3 px-6 py-6">
          <Mark className="h-7 w-7 text-ink" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[0.14em] text-ink">JANAYA</p>
            <p className="truncate text-xs text-ink-3">Shop system</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="ml-auto rounded-full p-1.5 text-ink-3 hover:bg-mist lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition ' +
                    (isActive
                      ? 'bg-ink font-medium text-white'
                      : 'text-ink-2 hover:bg-mist hover:text-ink')
                  }
                >
                  <item.icon size={17} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.to === '/products' && lowStock.length > 0 && (
                    <span className="tnum ml-auto rounded-full bg-warn/15 px-2 py-0.5 text-[0.7rem] font-semibold text-warn">
                      {lowStock.length}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line px-6 py-5 text-xs text-ink-3">
          Records are held in the MySQL database module.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-7">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-ink-2 hover:bg-mist lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          {/* Stock and delivery alerts link into the owner's modules, so only
              the owner sees them. */}
          {isOwner && (
            <Link
              to="/products"
              className="hidden items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-3 transition hover:border-ink hover:text-ink sm:flex"
            >
              {alerts > 0 ? (
                <>
                  <AlertTriangle size={15} className="text-warn" />
                  {alerts} item{alerts === 1 ? '' : 's'} need attention
                </>
              ) : (
                <>
                  <Bell size={15} />
                  No open alerts
                </>
              )}
            </Link>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-3">{user.title}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full p-2 text-ink-3 transition hover:bg-mist hover:text-bad"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-7 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
