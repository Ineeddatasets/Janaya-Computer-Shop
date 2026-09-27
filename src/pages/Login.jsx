import { useState } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, User } from 'lucide-react'
import { useAuth } from '../store/AuthContext.jsx'
import { landingFor } from '../lib/nav.js'
import { HeroScene, Mark } from '../storefront/art.jsx'
import { Button, Field, Input } from '../components/ui/Primitives.jsx'

export function Login() {
  const { user, signIn, pending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  if (user) return <Navigate to={location.state?.from || landingFor(user.role)} replace />

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      const account = await signIn(form.username, form.password)
      navigate(location.state?.from || landingFor(account.role), { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/*
        Left panel: one statement and nothing else. It used to list all six
        modules, which is a menu, not a welcome.
      */}
      <div className="relative hidden overflow-hidden bg-panel lg:block">
        <HeroScene className="absolute inset-0 h-full w-full opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/85" />
        {/* Weighted to the left, where the headline sits. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-14">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2.5 rounded-full bg-white/10 py-2.5 pr-5 pl-3.5 text-sm font-medium tracking-[0.14em] text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/18"
          >
            <Mark className="h-5 w-5" />
            JANAYA
          </Link>

          <div>
            <h2 className="display max-w-lg text-[clamp(2.8rem,4.4vw,4.2rem)] text-balance text-white">
              The whole shop, one screen.
            </h2>
            <p className="mt-6 max-w-sm text-[1.05rem] leading-relaxed text-white/60">
              Sales, stock, customers and suppliers, all reading from the same records.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft size={15} /> Back to the shop
          </Link>
        </div>
      </div>

      {/* Right panel: the form, with the heading doing the work. */}
      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-[26rem]">
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2.5 text-sm font-medium tracking-[0.14em] text-ink lg:hidden"
          >
            <Mark className="h-5 w-5" />
            JANAYA
          </Link>

          <h1 className="display text-[clamp(3rem,7vw,4rem)] text-ink">Sign in</h1>
          <p className="mt-4 text-[1.05rem] text-ink-3">Owner and staff sign in here.</p>

          <form onSubmit={onSubmit} className="mt-11 space-y-5">
            <Field label="Username" required>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3"
                />
                <Input
                  className="py-3.5 pl-11"
                  autoFocus
                  autoComplete="username"
                  placeholder="owner"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </Field>

            <Field label="Password" required error={error}>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3"
                />
                <Input
                  className="py-3.5 pl-11"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full !py-3.5"
              disabled={pending || !form.username || !form.password}
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
