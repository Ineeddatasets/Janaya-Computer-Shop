import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../store/AuthContext.jsx'
import { Mark } from './art.jsx'
import { initials } from '../lib/format.js'

const MARKETING_LINKS = [
  { href: '/#range', label: 'The range' },
  { href: '/#builds', label: 'Builds' },
  { href: '/#how', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
]

export function Nav() {
  const { user, signOut } = useAuth()
  const { pathname, hash } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // The glass treatment only makes sense over the dark hero on the home page.
  const overHero = pathname === '/'

  useEffect(() => {
    if (!overHero) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overHero])

  useEffect(() => setOpen(false), [pathname, hash])

  const links = MARKETING_LINKS
  const solid = scrolled

  const chip = solid ? 'bg-ink text-white' : 'bg-white/12 text-white ring-1 ring-white/20'

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <nav className="pointer-events-auto mx-auto flex max-w-[1180px] items-center gap-3">
        <Link
          to="/"
          className={
            'flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-semibold tracking-[0.14em] backdrop-blur-md transition ' +
            chip
          }
        >
          <Mark className="h-5 w-5" />
          JANAYA
        </Link>

        <div
          className={
            'mx-auto hidden items-center gap-1 rounded-full p-1.5 backdrop-blur-md transition md:flex ' +
            (solid ? 'bg-ink' : 'bg-white/12 ring-1 ring-white/20')
          }
        >
          {links.map((link) =>
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className={
                  'rounded-full px-4 py-2 text-sm transition ' +
                  (pathname === link.to
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:bg-white/12 hover:text-white')
                }
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-white/75 transition hover:bg-white/12 hover:text-white"
              >
                {link.label}
              </a>
            ),
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <div className={'hidden items-center gap-2.5 rounded-full py-1.5 pr-2 pl-4 backdrop-blur-md transition sm:flex ' + chip}>
              <Link to="/home" className="text-sm font-medium hover:underline">
                {user.name.split(' ')[0]}
              </Link>
              <span
                className={
                  'grid h-7 w-7 place-items-center rounded-full text-[0.65rem] font-semibold ' +
                  (solid ? 'bg-white/15 text-white' : 'bg-white/20 text-white')
                }
              >
                {initials(user.name)}
              </span>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/12 hover:text-white"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={
                'hidden rounded-full px-5 py-2.5 text-sm font-medium transition sm:inline-flex ' +
                (solid ? 'bg-ink text-white hover:bg-ink-2' : 'bg-white text-ink hover:bg-white/90')
              }
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={
              'inline-flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition md:hidden ' +
              chip
            }
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="pointer-events-auto mx-auto mt-3 max-w-[1180px] overflow-hidden rounded-2xl bg-ink p-2 md:hidden">
          {links.map((link) =>
            link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10"
              >
                {link.label}
              </a>
            ),
          )}
          {user && (
            <Link
              to="/home"
              className="block rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10"
            >
              Shop system
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="mt-1 block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-ink"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="mt-1 block rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-ink"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="bg-white px-5 pt-16 pb-10 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="sf-rule" />
        <div className="grid gap-10 pt-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-ink">
              <Mark className="h-6 w-6" />
              <span className="text-sm font-semibold tracking-[0.14em]">JANAYA</span>
            </div>
            <p className="sf-lead mt-4 max-w-xs text-[0.92rem] text-[var(--ink-2)]">
              Computers sold, built and repaired on Paseo del Congreso since 2015.
            </p>
          </div>

          <nav>
            <p className="sf-eyebrow">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-2)]">
              {MARKETING_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[var(--ink)]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="sf-eyebrow">Visit</p>
            <address className="mt-4 space-y-2.5 text-sm text-[var(--ink-2)] not-italic">
              <p>
                Paseo del Congreso
                <br />
                Malolos, Bulacan
              </p>
              <p>
                <a href="tel:+639175550143" className="hover:text-[var(--ink)]">
                  0917 555 0143
                </a>
              </p>
            </address>
          </div>

          <div>
            <p className="sf-eyebrow">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-2)]">
              {user ? (
                <li>
                  <Link to="/home" className="hover:text-[var(--ink)]">
                    Shop system
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/login" className="hover:text-[var(--ink)]">
                    Staff sign in
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-[0.82rem] text-[var(--ink-3)]">
          <p>© {new Date().getFullYear()} Janaya Computer Shop. All rights reserved.</p>
          <p>Prices include VAT. Stock shown is live from the shop system.</p>
        </div>
      </div>
    </footer>
  )
}
