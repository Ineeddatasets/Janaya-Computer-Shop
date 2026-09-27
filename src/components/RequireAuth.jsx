import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'
import { landingFor } from '../lib/nav.js'

/**
 * Guards a route. Without `roles` it only checks that someone is signed in;
 * with `roles` it also checks the account is allowed, so typing a URL by hand
 * cannot get a cashier into the owner's screens.
 */
export function RequireAuth({ roles, children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={landingFor(user.role)} replace />
  }
  return children
}
