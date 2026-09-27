/**
 * Seed records for the mock database.
 *
 * Each product carries an `art` key naming its SVG drawing in
 * src/storefront/productArt.jsx, and an `image` field for a real photograph.
 * Set `image` to a URL or an imported file and it wins over the drawing;
 * nothing else has to change.
 *
 * Shapes mirror the MySQL tables named in the architecture diagram:
 * users, customers, products, sales (+ sale items), suppliers, purchase orders.
 * Nothing outside src/data should import this file — go through api.js.
 */

export const VAT_RATE = 0.12

export const users = [
  {
    id: 'U-001',
    username: 'owner',
    password: 'owner123',
    name: 'Janaya Reyes',
    role: 'owner',
    title: 'Store Owner',
  },
  {
    id: 'U-002',
    username: 'cashier',
    password: 'cashier123',
    name: 'Mark Villanueva',
    role: 'cashier',
    title: 'Cashier / Staff',
  },
]

export const categories = [
  'Laptops',
  'Desktops',
  'Components',
  'Peripherals',
  'Storage',
  'Networking',
  'Accessories',
]

export const suppliers = [
  {
    id: 'S-001',
    name: 'NorthBridge Distribution',
    contactPerson: 'Alfredo Santos',
    phone: '0917 555 2841',
    email: 'sales@northbridge.ph',
    address: '18 Sucat Road, Parañaque City',
    supplies: 'Laptops, Desktops',
  },
  {
    id: 'S-002',
    name: 'CoreTech Components',
    contactPerson: 'Liza Mendoza',
    phone: '0918 442 7710',
    email: 'orders@coretech.ph',
    address: 'Unit 4B Gilmore IT Center, Quezon City',
    supplies: 'Components, Storage',
  },
  {
    id: 'S-003',
    name: 'PeriMax Trading',
    contactPerson: 'Ronnie Cruz',
    phone: '0999 310 6624',
    email: 'ronnie@perimax.com.ph',
    address: '9 Banawe Street, Quezon City',
    supplies: 'Peripherals, Accessories',
  },
  {
    id: 'S-004',
    name: 'LinkWave Networks',
    contactPerson: 'Grace Delos Reyes',
    phone: '0927 806 1195',
    email: 'grace@linkwave.ph',
    address: '221 Ortigas Ave, Pasig City',
    supplies: 'Networking',
  },
]

/**
 * Product photography.
 *
 * These are Unsplash photos, used under the Unsplash Licence, which permits
 * commercial use without attribution. They are stand-ins: generic pictures of
 * the right kind of hardware rather than the exact model, because the shop has
 * no licence to a manufacturer's own product shots. Replace each one with a
 * photograph of the actual unit on the shelf and the site becomes truthful as
 * well as attractive.
 */
const photo = (id) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=640&q=80'

export const products = [
  { id: 'P-001', sku: 'LAP-ACR-A15', name: 'Acer Aspire 15 (i5 / 16GB / 512GB)', category: 'Laptops', supplierId: 'S-001', cost: 28500, price: 34995, stock: 7, reorderPoint: 3 , art: 'laptop', image: photo('photo-1588872657578-7efd1f1555ed') },
  { id: 'P-002', sku: 'LAP-LEN-IP3', name: 'Lenovo IdeaPad Slim 3 (Ryzen 5)', category: 'Laptops', supplierId: 'S-001', cost: 24800, price: 29995, stock: 4, reorderPoint: 3 , art: 'laptop', image: photo('photo-1593642702821-c8da6771f0c6') },
  { id: 'P-003', sku: 'LAP-ASU-TUF', name: 'ASUS TUF Gaming F15 (RTX 4050)', category: 'Laptops', supplierId: 'S-001', cost: 52000, price: 62995, stock: 2, reorderPoint: 3 , art: 'laptop', image: photo('photo-1618424181497-157f25b6ddd5') },
  { id: 'P-004', sku: 'DSK-JNY-OFF', name: 'Janaya Office Build (i3 / 8GB / 256GB)', category: 'Desktops', supplierId: 'S-001', cost: 17200, price: 21500, stock: 6, reorderPoint: 2 , art: 'tower', image: photo('photo-1591238372338-22d30c883a86') },
  { id: 'P-005', sku: 'DSK-JNY-GMR', name: 'Janaya Gamer Build (i5 / RTX 3060)', category: 'Desktops', supplierId: 'S-001', cost: 46000, price: 56900, stock: 3, reorderPoint: 2 , art: 'tower', image: photo('photo-1587302912306-cf1ed9c33146') },
  { id: 'P-006', sku: 'CMP-CPU-R55', name: 'AMD Ryzen 5 5600 Processor', category: 'Components', supplierId: 'S-002', cost: 6100, price: 7850, stock: 14, reorderPoint: 5 , art: 'cpu', image: photo('photo-1523655223303-4e9ef5234587') },
  { id: 'P-007', sku: 'CMP-GPU-3060', name: 'GeForce RTX 3060 12GB', category: 'Components', supplierId: 'S-002', cost: 16500, price: 20450, stock: 5, reorderPoint: 3 , art: 'gpu', image: photo('photo-1555618254-84e2cf498b01') },
  { id: 'P-008', sku: 'CMP-RAM-16K', name: 'Kingston Fury 16GB DDR4 3200', category: 'Components', supplierId: 'S-002', cost: 2150, price: 2999, stock: 22, reorderPoint: 8 , art: 'ram', image: photo('photo-1541029071515-84cc54f84dc5') },
  { id: 'P-009', sku: 'CMP-MBO-B550', name: 'MSI B550M Pro-VDH Motherboard', category: 'Components', supplierId: 'S-002', cost: 4700, price: 6150, stock: 9, reorderPoint: 4 , art: 'motherboard', image: photo('photo-1592664474505-51c549ad15c5') },
  { id: 'P-010', sku: 'CMP-PSU-650', name: 'Seasonic 650W 80+ Bronze PSU', category: 'Components', supplierId: 'S-002', cost: 3300, price: 4290, stock: 11, reorderPoint: 4 , art: 'psu', image: photo('photo-1716062890647-60feae0609d0') },
  { id: 'P-011', sku: 'STO-SSD-1TB', name: 'Samsung 980 NVMe SSD 1TB', category: 'Storage', supplierId: 'S-002', cost: 3900, price: 5250, stock: 18, reorderPoint: 6 , art: 'ssd', image: photo('photo-1653179767378-98bb414f9bfd') },
  { id: 'P-012', sku: 'STO-HDD-2TB', name: 'Seagate Barracuda 2TB HDD', category: 'Storage', supplierId: 'S-002', cost: 2400, price: 3350, stock: 12, reorderPoint: 5 , art: 'hdd', image: photo('photo-1531492746076-161ca9bcad58') },
  { id: 'P-013', sku: 'STO-EXT-1TB', name: 'WD Elements 1TB Portable Drive', category: 'Storage', supplierId: 'S-002', cost: 2600, price: 3495, stock: 2, reorderPoint: 5 , art: 'extdrive', image: photo('photo-1602493054445-4a0b4fa7fdd6') },
  { id: 'P-014', sku: 'PER-MON-24', name: 'AOC 24" 144Hz Gaming Monitor', category: 'Peripherals', supplierId: 'S-003', cost: 7400, price: 9495, stock: 8, reorderPoint: 3 , art: 'monitor', image: photo('photo-1619597455322-4fbbd820250a') },
  { id: 'P-015', sku: 'PER-KBD-MEC', name: 'Redragon Kumara Mechanical Keyboard', category: 'Peripherals', supplierId: 'S-003', cost: 1150, price: 1699, stock: 25, reorderPoint: 10 , art: 'keyboard', image: photo('photo-1613442986373-af81e5c618d3') },
  { id: 'P-016', sku: 'PER-MSE-G102', name: 'Logitech G102 Gaming Mouse', category: 'Peripherals', supplierId: 'S-003', cost: 950, price: 1450, stock: 31, reorderPoint: 10 , art: 'mouse', image: photo('photo-1551739440-5dd934d3a94a') },
  { id: 'P-017', sku: 'PER-HST-H111', name: 'Logitech H111 Stereo Headset', category: 'Peripherals', supplierId: 'S-003', cost: 480, price: 795, stock: 27, reorderPoint: 10 , art: 'headset', image: photo('photo-1583394838336-acd977736f90') },
  { id: 'P-018', sku: 'PER-PRN-L3210', name: 'Epson L3210 Ink Tank Printer', category: 'Peripherals', supplierId: 'S-003', cost: 7900, price: 9750, stock: 6, reorderPoint: 3 , art: 'printer', image: photo('photo-1612815154858-60aa4c59eaa6') },
  { id: 'P-019', sku: 'NET-RTR-AC12', name: 'TP-Link Archer C6 AC1200 Router', category: 'Networking', supplierId: 'S-004', cost: 1750, price: 2495, stock: 10, reorderPoint: 4 , art: 'router', image: photo('photo-1606904825846-647eb07f5be2') },
  { id: 'P-020', sku: 'NET-SWT-8P', name: 'TP-Link 8-Port Gigabit Switch', category: 'Networking', supplierId: 'S-004', cost: 1250, price: 1795, stock: 7, reorderPoint: 3 , art: 'switch', image: photo('photo-1750711158632-5273ec9b9b86') },
  { id: 'P-021', sku: 'NET-CBL-CAT6', name: 'CAT6 Patch Cable 3m', category: 'Networking', supplierId: 'S-004', cost: 120, price: 249, stock: 64, reorderPoint: 20 , art: 'cable', image: photo('photo-1578016980868-197203ff4b02') },
  { id: 'P-022', sku: 'ACC-UPS-650', name: 'APC 650VA UPS Backup', category: 'Accessories', supplierId: 'S-003', cost: 3100, price: 4195, stock: 9, reorderPoint: 4 , art: 'ups', image: null },
  { id: 'P-023', sku: 'ACC-BAG-15', name: 'Laptop Backpack 15.6"', category: 'Accessories', supplierId: 'S-003', cost: 650, price: 1095, stock: 16, reorderPoint: 6 , art: 'backpack', image: photo('photo-1553062407-98eeb64c6a62') },
  { id: 'P-024', sku: 'ACC-HUB-USB', name: 'USB-C 6-in-1 Hub', category: 'Accessories', supplierId: 'S-003', cost: 720, price: 1250, stock: 3, reorderPoint: 6 , art: 'hub', image: photo('photo-1760376789487-994070337c76') },
]

export const customers = [
  { id: 'C-001', name: 'Maria Dela Cruz', phone: '0917 221 4408', email: 'maria.dc@gmail.com', address: '12 Rizal St, Malolos, Bulacan', type: 'Walk-in', joined: '2025-01-14' },
  { id: 'C-002', name: 'St. Anne Learning Center', phone: '044 791 2233', email: 'admin@stannelc.edu.ph', address: 'Paseo del Congreso, Malolos', type: 'Corporate', joined: '2025-02-02' },
  { id: 'C-003', name: 'Joel Ramirez', phone: '0928 660 1174', email: 'joelram@yahoo.com', address: '5 Mabini Ave, Guiguinto', type: 'Regular', joined: '2025-02-19' },
  { id: 'C-004', name: 'Karen Bautista', phone: '0946 118 3390', email: 'karen.bau@gmail.com', address: '77 Bonifacio St, Plaridel', type: 'Regular', joined: '2025-03-08' },
  { id: 'C-005', name: 'NetHive Internet Cafe', phone: '0915 442 8871', email: 'nethive.cafe@gmail.com', address: 'Km 44 McArthur Hwy, Pulilan', type: 'Corporate', joined: '2025-03-21' },
  { id: 'C-006', name: 'Dennis Aquino', phone: '0977 205 6613', email: 'dennisaq@gmail.com', address: '23 Sampaguita, Baliuag', type: 'Walk-in', joined: '2025-04-11' },
  { id: 'C-007', name: 'Cherry Lim', phone: '0919 774 3025', email: 'cherrylim@outlook.com', address: '8 Narra St, Calumpit', type: 'Regular', joined: '2025-05-02' },
  { id: 'C-008', name: 'Bulacan Auto Parts Inc.', phone: '044 662 7719', email: 'purchasing@bulautoparts.ph', address: 'Industrial Rd, Marilao', type: 'Corporate', joined: '2025-06-17' },
]

export const purchaseOrders = [
  { id: 'PO-1041', supplierId: 'S-001', orderDate: '2026-08-24', expectedDate: '2026-09-02', status: 'Delivered', items: [{ productId: 'P-001', qty: 6, cost: 28500 }, { productId: 'P-004', qty: 4, cost: 17200 }] },
  { id: 'PO-1042', supplierId: 'S-002', orderDate: '2026-08-28', expectedDate: '2026-09-05', status: 'Delivered', items: [{ productId: 'P-008', qty: 20, cost: 2150 }, { productId: 'P-011', qty: 15, cost: 3900 }] },
  { id: 'PO-1043', supplierId: 'S-003', orderDate: '2026-09-01', expectedDate: '2026-09-08', status: 'In Transit', items: [{ productId: 'P-016', qty: 24, cost: 950 }, { productId: 'P-024', qty: 12, cost: 720 }] },
  { id: 'PO-1044', supplierId: 'S-002', orderDate: '2026-09-03', expectedDate: '2026-09-11', status: 'Pending', items: [{ productId: 'P-007', qty: 8, cost: 16500 }] },
  { id: 'PO-1045', supplierId: 'S-004', orderDate: '2026-08-19', expectedDate: '2026-09-04', status: 'Delayed', items: [{ productId: 'P-019', qty: 10, cost: 1750 }, { productId: 'P-021', qty: 50, cost: 120 }] },
  { id: 'PO-1046', supplierId: 'S-001', orderDate: '2026-09-06', expectedDate: '2026-09-16', status: 'Pending', items: [{ productId: 'P-003', qty: 4, cost: 52000 }] },
]

/* ------------------------------------------------------------------ */
/* Sales history                                                       */
/* ------------------------------------------------------------------ */

/**
 * Deterministic pseudo-random generator. A fixed seed means the reports and
 * dashboard show the same figures on every reload, which matters when the
 * system is being demonstrated.
 */
function makeRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const PAYMENT_METHODS = ['Cash', 'Cash', 'Cash', 'GCash', 'Card']

function buildSalesHistory() {
  const rand = makeRandom(20260909)
  const list = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let counter = 1

  // 120 days of history gives the monthly report several full bars to draw.
  for (let dayOffset = 119; dayOffset >= 0; dayOffset--) {
    const day = new Date(today)
    day.setDate(day.getDate() - dayOffset)

    // Weekends are busier in a mall-adjacent shop; Mondays are slow.
    const weekday = day.getDay()
    const base = weekday === 0 || weekday === 6 ? 5 : weekday === 1 ? 2 : 3
    const count = base + Math.floor(rand() * 3)

    for (let n = 0; n < count; n++) {
      const lineCount = 1 + Math.floor(rand() * 3)
      const items = []
      for (let l = 0; l < lineCount; l++) {
        const product = products[Math.floor(rand() * products.length)]
        if (items.some((i) => i.productId === product.id)) continue
        const qty = product.price > 20000 ? 1 : 1 + Math.floor(rand() * 3)
        items.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty,
        })
      }
      if (!items.length) continue

      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
      const vat = Math.round(subtotal * VAT_RATE * 100) / 100
      const total = Math.round((subtotal + vat) * 100) / 100

      const at = new Date(day)
      at.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0)

      // Roughly half of walk-in sales are never tied to a customer record.
      const hasCustomer = rand() > 0.45
      const customer = customers[Math.floor(rand() * customers.length)]
      const cashier = rand() > 0.35 ? users[1] : users[0]
      const method = PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)]
      const tendered =
        method === 'Cash' ? Math.ceil(total / 500) * 500 : Math.round(total * 100) / 100

      list.push({
        id: 'SL-' + String(counter).padStart(5, '0'),
        invoiceNo: 'INV-' + String(10000 + counter),
        date: at.toISOString(),
        customerId: hasCustomer ? customer.id : null,
        customerName: hasCustomer ? customer.name : 'Walk-in Customer',
        cashierId: cashier.id,
        cashierName: cashier.name,
        items,
        subtotal,
        vat,
        total,
        payment: { method, tendered, change: Math.round((tendered - total) * 100) / 100 },
      })
      counter++
    }
  }

  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const sales = buildSalesHistory()
