import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../data/api.js'
import { useAuth } from './AuthContext.jsx'

const ShopContext = createContext(null)

/**
 * Holds every table the screens read from, plus the mutations that keep the
 * local copy in step with api.js. Screens never call api.js directly for
 * writes, so a single sale updates the products table, the sales table and
 * therefore the dashboard in one pass.
 */
export function ShopProvider({ children }) {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Only signed-in staff load the shop's tables. The public storefront reads
  // products through its own call, so anonymous visitors load nothing here.
  // Re-runs on sign in and sign out.
  useEffect(() => {
    let cancelled = false
    const set = (p, c, s, po, sl) => {
      if (cancelled) return
      setProducts(p)
      setCustomers(c)
      setSuppliers(s)
      setPurchaseOrders(po)
      setSales(sl)
      setLoading(false)
    }

    if (!user) {
      set([], [], [], [], [])
      return
    }

    setLoading(true)
    const isOwner = user.role === 'owner'

    // Retried for the same reason the storefront retries: on a free host the
    // server sleeps, and the first call after a nap can fail. Giving up
    // quietly would leave the owner staring at an empty inventory.
    const loadOnce = () =>
      Promise.all([
        api.listProducts(),
        api.listCustomers(),
        api.listSales(),
        // Suppliers and purchase orders belong to the owner's modules. The API
        // refuses them for a cashier, so the cashier's app does not ask.
        isOwner ? api.listSuppliers() : Promise.resolve([]),
        isOwner ? api.listPurchaseOrders() : Promise.resolve([]),
      ])

    ;(async () => {
      const waits = [1000, 2000, 4000, 8000]
      for (let attempt = 0; attempt <= waits.length; attempt++) {
        try {
          const [p, c, sl, s, po] = await loadOnce()
          set(p, c, s, po, sl)
          return
        } catch {
          if (cancelled) return
          if (attempt === waits.length) {
            set([], [], [], [], [])
            return
          }
          await new Promise((r) => setTimeout(r, waits[attempt]))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const replaceIn = (setter) => (record) =>
    setter((list) => list.map((row) => (row.id === record.id ? record : row)))

  /* ----- products ----- */

  const addProduct = useCallback(async (input) => {
    const product = await api.createProduct(input)
    setProducts((list) => [...list, product])
    return product
  }, [])

  const editProduct = useCallback(async (id, patch) => {
    const product = await api.updateProduct(id, patch)
    replaceIn(setProducts)(product)
    return product
  }, [])

  const removeProduct = useCallback(async (id) => {
    await api.deleteProduct(id)
    setProducts((list) => list.filter((p) => p.id !== id))
  }, [])

  const changeStock = useCallback(async (id, delta) => {
    const product = await api.adjustStock(id, delta)
    replaceIn(setProducts)(product)
    return product
  }, [])

  /* ----- customers ----- */

  const addCustomer = useCallback(async (input) => {
    const customer = await api.createCustomer(input)
    setCustomers((list) => [...list, customer])
    return customer
  }, [])

  const editCustomer = useCallback(async (id, patch) => {
    const customer = await api.updateCustomer(id, patch)
    replaceIn(setCustomers)(customer)
    return customer
  }, [])

  const removeCustomer = useCallback(async (id) => {
    await api.deleteCustomer(id)
    setCustomers((list) => list.filter((c) => c.id !== id))
  }, [])

  /* ----- suppliers & purchase orders ----- */

  const addSupplier = useCallback(async (input) => {
    const supplier = await api.createSupplier(input)
    setSuppliers((list) => [...list, supplier])
    return supplier
  }, [])

  const editSupplier = useCallback(async (id, patch) => {
    const supplier = await api.updateSupplier(id, patch)
    replaceIn(setSuppliers)(supplier)
    return supplier
  }, [])

  const removeSupplier = useCallback(async (id) => {
    await api.deleteSupplier(id)
    setSuppliers((list) => list.filter((s) => s.id !== id))
  }, [])

  const addPurchaseOrder = useCallback(async (input) => {
    const order = await api.createPurchaseOrder(input)
    setPurchaseOrders((list) => [...list, order])
    return order
  }, [])

  // Receiving a delivery raises stock, so the products table is refetched.
  const setOrderStatus = useCallback(async (id, status) => {
    const order = await api.setPurchaseOrderStatus(id, status)
    replaceIn(setPurchaseOrders)(order)
    if (status === 'Delivered') setProducts(await api.listProducts())
    return order
  }, [])

  /* ----- sales ----- */

  const recordSale = useCallback(async (payload) => {
    const sale = await api.createSale(payload)
    setSales((list) => [sale, ...list])
    setProducts(await api.listProducts())
    return sale
  }, [])

  /* ----- derived views used by more than one screen ----- */

  const lowStock = useMemo(
    () => products.filter((p) => p.stock <= p.reorderPoint),
    [products],
  )

  const openDeliveries = useMemo(
    () => purchaseOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled'),
    [purchaseOrders],
  )

  const productById = useCallback(
    (id) => products.find((p) => p.id === id),
    [products],
  )

  const supplierById = useCallback(
    (id) => suppliers.find((s) => s.id === id),
    [suppliers],
  )

  const salesForCustomer = useCallback(
    (customerId) => sales.filter((s) => s.customerId === customerId),
    [sales],
  )

  const value = {
    loading,
    products,
    customers,
    suppliers,
    purchaseOrders,
    sales,
    lowStock,
    openDeliveries,
    productById,
    supplierById,
    salesForCustomer,
    addProduct,
    editProduct,
    removeProduct,
    changeStock,
    addCustomer,
    editCustomer,
    removeCustomer,
    addSupplier,
    editSupplier,
    removeSupplier,
    addPurchaseOrder,
    setOrderStatus,
    recordSale,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside ShopProvider')
  return ctx
}
