import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { RequireAuth } from './components/RequireAuth.jsx'
import { useAuth } from './store/AuthContext.jsx'
import { landingFor } from './lib/nav.js'
import { Login } from './pages/Login.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Sales } from './pages/Sales.jsx'
import { Receipt } from './pages/Receipt.jsx'
import { Products } from './pages/Products.jsx'
import { Customers } from './pages/Customers.jsx'
import { Suppliers } from './pages/Suppliers.jsx'
import { Reports } from './pages/Reports.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { Storefront } from './storefront/Storefront.jsx'

export function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* The public storefront. No session required. */}
      <Route path="/" element={<Storefront />} />
      <Route path="/login" element={<Login />} />
      <Route path="/shop" element={<Navigate to="/" replace />} />

      {/* A receipt is a document, so it gets no shell at all. Staff only. */}
      <Route
        path="/sales/receipt/:saleId"
        element={
          <RequireAuth roles={['owner', 'cashier']}>
            <Receipt />
          </RequireAuth>
        }
      />

      {/* The staff system. */}
      <Route
        element={
          <RequireAuth roles={['owner', 'cashier']}>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route
          path="/home"
          element={<Navigate to={user ? landingFor(user.role) : '/login'} replace />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={['owner']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/sales"
          element={
            <RequireAuth roles={['owner', 'cashier']}>
              <Sales />
            </RequireAuth>
          }
        />
        <Route
          path="/products"
          element={
            <RequireAuth roles={['owner']}>
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/customers"
          element={
            <RequireAuth roles={['owner', 'cashier']}>
              <Customers />
            </RequireAuth>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RequireAuth roles={['owner']}>
              <Suppliers />
            </RequireAuth>
          }
        />

        <Route
          path="/reports"
          element={
            <RequireAuth roles={['owner']}>
              <Reports />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
