import { LayoutDashboard, ShoppingCart, Package, Users, Truck, BarChart3 } from 'lucide-react'

/**
 * One source of truth for navigation and route access.
 *
 * The sidebar renders the entries the signed-in role may reach and the route
 * guard reads the same list, so the menu and the guard can never disagree.
 */
export const navigation = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tone: 'dashboard',
    roles: ['owner'],
    description: 'Sales summary, stock status and notifications',
  },
  {
    to: '/sales',
    label: 'Sales',
    icon: ShoppingCart,
    tone: 'sales',
    roles: ['owner', 'cashier'],
    description: 'Record a sale and print the receipt',
  },
  {
    to: '/products',
    label: 'Products & Inventory',
    icon: Package,
    tone: 'product',
    roles: ['owner'],
    description: 'Stock levels, pricing and low stock alerts',
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: Users,
    tone: 'customer',
    roles: ['owner', 'cashier'],
    description: 'Customer records and purchase history',
  },
  {
    to: '/suppliers',
    label: 'Suppliers',
    icon: Truck,
    tone: 'supplier',
    roles: ['owner'],
    description: 'Supplier details, purchase orders and deliveries',
  },
  {
    to: '/reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    tone: 'report',
    roles: ['owner'],
    description: 'Daily and monthly sales, inventory and best sellers',
  },
]

/** Every entry here is a staff module; the customer's own links live in
 *  src/storefront/chrome.jsx, because they belong to the storefront design. */
export const staffNavigation = navigation

export function navigationFor(role) {
  return navigation.filter((item) => item.roles.includes(role))
}

/** Where each role lands after signing in. */
export function landingFor(role) {
  if (role === 'owner') return '/dashboard'
  return '/sales'
}
