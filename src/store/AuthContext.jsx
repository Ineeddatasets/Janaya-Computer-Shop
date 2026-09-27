import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../data/api.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'janaya.session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [pending, setPending] = useState(false)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* private browsing: the session simply will not survive a refresh */
    }
  }, [user])

  // The cached user gives an instant first paint; the server session is the
  // real authority. On load we reconcile: a expired cookie clears the cache,
  // and a valid cookie signs the user back in even if the cache was empty.
  useEffect(() => {
    let cancelled = false
    api.me().then((account) => {
      if (!cancelled) setUser(account)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (username, password) => {
    setPending(true)
    try {
      const account = await api.login(username, password)
      setUser(account)
      return account
    } finally {
      setPending(false)
    }
  }, [])

  // End the server session, then clear local state regardless of the result.
  const signOut = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      /* already gone, or offline — clearing locally is enough */
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      pending,
      signIn,
      signOut,
      isOwner: user?.role === 'owner',
      isCashier: user?.role === 'cashier',
      isStaff: user?.role === 'owner' || user?.role === 'cashier',
    }),
    [user, pending, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
