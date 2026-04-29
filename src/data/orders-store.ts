export type FulfillmentMode = 'online' | 'pickup'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packing'
  | 'shipped'
  | 'ready_pickup'
  | 'completed'
  | 'cancelled'

export type LogisticsProvider = 'J&T Express' | 'Lalamove' | 'Pos Laju' | 'Ninja Van' | 'DHL eCommerce'

export type OrderLine = {
  sku: string
  name: string
  qty: number
  unitPrice: number
}

export type StoreOrder = {
  id: string
  createdAt: string
  customerId: string
  customerName: string
  customerPhone: string
  outletId: string
  outletName: string
  fulfillment: FulfillmentMode
  status: OrderStatus
  lines: OrderLine[]
  subtotal: number
  sst: number
  total: number
  shippingAddress?: string
  trackingRef?: string
  logisticsProvider?: LogisticsProvider | null
  notes?: string
}

const STORAGE_KEY = 'franchise-os-orders-v2'
const EVENT = 'franchise-orders-updated'

/** Demo loyalty customer — matches seeded orders in `defaultSeed`. */
export const DEMO_CUSTOMER_ID = 'cust-demo-1'

function emit() {
  window.dispatchEvent(new Event(EVENT))
}

export const LOGISTICS_OPTIONS: LogisticsProvider[] = [
  'J&T Express',
  'Lalamove',
  'Pos Laju',
  'Ninja Van',
  'DHL eCommerce',
]

function defaultSeed(): StoreOrder[] {
  return [
    {
      id: 'ORD-MV-240429-09',
      createdAt: new Date(2026, 3, 29, 8, 45).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'pickup',
      status: 'pending',
      lines: [
        { sku: 'CP-002', name: 'USB-C 7-in-1 Hub', qty: 1, unitPrice: 149 },
        { sku: 'MB-003', name: 'Foldable Phone Stand', qty: 1, unitPrice: 49 },
      ],
      subtotal: 198,
      sst: 11.88,
      total: 209.88,
    },
    {
      id: 'ORD-MV-240428-08',
      createdAt: new Date(2026, 3, 28, 18, 12).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'pv',
      outletName: 'Pavilion KL',
      fulfillment: 'online',
      status: 'confirmed',
      lines: [
        { sku: 'MB-001', name: '10000mAh Power Bank', qty: 1, unitPrice: 119 },
        { sku: 'AC-002', name: 'Braided USB-C Cable 2m', qty: 2, unitPrice: 45 },
      ],
      subtotal: 209,
      sst: 12.54,
      total: 221.54,
      shippingAddress: 'A-12-04, Damansara Heights, 50490 KL',
      notes: 'Leave at guardhouse if no answer.',
    },
    {
      id: 'ORD-MV-240418-01',
      createdAt: new Date(2026, 3, 18, 11, 24).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'online',
      status: 'shipped',
      lines: [
        { sku: 'MB-002', name: 'Fitness Smartwatch SE', qty: 1, unitPrice: 399 },
        { sku: 'AC-001', name: '65W GaN Charger (2-Port)', qty: 1, unitPrice: 99 },
      ],
      subtotal: 498,
      sst: 29.88,
      total: 527.88,
      shippingAddress: 'A-12-04, Damansara Heights, 50490 KL',
      trackingRef: 'JT892774102MY',
      logisticsProvider: 'J&T Express',
    },
    {
      id: 'ORD-MV-240427-06',
      createdAt: new Date(2026, 3, 27, 15, 40).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'online',
      status: 'shipped',
      lines: [
        { sku: 'AU-002', name: 'Portable Bluetooth Speaker', qty: 1, unitPrice: 199 },
        { sku: 'CP-004', name: 'FHD 1080p Webcam', qty: 1, unitPrice: 199 },
      ],
      subtotal: 398,
      sst: 23.88,
      total: 421.88,
      shippingAddress: 'A-12-04, Damansara Heights, 50490 KL',
      trackingRef: 'NV442881903MY',
      logisticsProvider: 'Ninja Van',
    },
    {
      id: 'ORD-MV-240428-03',
      createdAt: new Date(2026, 3, 28, 14, 0).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'pickup',
      status: 'packing',
      lines: [{ sku: 'AU-002', name: 'Portable Bluetooth Speaker', qty: 1, unitPrice: 199 }],
      subtotal: 199,
      sst: 11.94,
      total: 210.94,
    },
    {
      id: 'ORD-MV-240425-02',
      createdAt: new Date(2026, 3, 25, 9, 5).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'pickup',
      status: 'ready_pickup',
      lines: [{ sku: 'CP-001', name: 'Ergonomic Wireless Mouse', qty: 2, unitPrice: 79 }],
      subtotal: 158,
      sst: 9.48,
      total: 167.48,
    },
    {
      id: 'ORD-MV-240424-05',
      createdAt: new Date(2026, 3, 24, 10, 20).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'pv',
      outletName: 'Pavilion KL',
      fulfillment: 'pickup',
      status: 'ready_pickup',
      lines: [
        { sku: 'CP-003', name: 'Mechanical Keyboard RGB', qty: 1, unitPrice: 329 },
        { sku: 'AU-001', name: 'True Wireless Earbuds Pro', qty: 1, unitPrice: 249 },
      ],
      subtotal: 578,
      sst: 34.68,
      total: 612.68,
    },
    {
      id: 'ORD-MV-240401-04',
      createdAt: new Date(2026, 3, 1, 16, 30).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'online',
      status: 'completed',
      lines: [{ sku: 'CP-004', name: 'FHD 1080p Webcam', qty: 1, unitPrice: 199 }],
      subtotal: 199,
      sst: 11.94,
      total: 210.94,
      shippingAddress: 'A-12-04, Damansara Heights, 50490 KL',
      trackingRef: 'PL789012345MY',
      logisticsProvider: 'Pos Laju',
    },
    {
      id: 'ORD-MV-240315-02',
      createdAt: new Date(2026, 2, 15, 13, 0).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'pickup',
      status: 'completed',
      lines: [
        { sku: 'MB-004', name: 'Magnetic Car Phone Mount', qty: 1, unitPrice: 69 },
        { sku: 'MB-003', name: 'Foldable Phone Stand', qty: 1, unitPrice: 49 },
      ],
      subtotal: 118,
      sst: 7.08,
      total: 125.08,
    },
    {
      id: 'ORD-MV-240208-01',
      createdAt: new Date(2026, 1, 8, 19, 45).toISOString(),
      customerId: 'cust-demo-1',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: 'online',
      status: 'completed',
      lines: [{ sku: 'CP-003', name: 'Mechanical Keyboard RGB', qty: 1, unitPrice: 329 }],
      subtotal: 329,
      sst: 19.74,
      total: 348.74,
      shippingAddress: 'A-12-04, Damansara Heights, 50490 KL',
      trackingRef: 'LLM-KL-889210',
      logisticsProvider: 'Lalamove',
    },
  ]
}

export function loadOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = defaultSeed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw) as StoreOrder[]
    return Array.isArray(parsed) ? parsed : defaultSeed()
  } catch {
    return defaultSeed()
  }
}

function saveOrders(orders: StoreOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  emit()
}

export function subscribeOrders(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

export function placeOrder(order: Omit<StoreOrder, 'id' | 'createdAt' | 'status'> & { status?: OrderStatus }) {
  const existing = loadOrders()
  const orders = [...existing]
  const id = `ORD-MV-${String(orders.length + 1).padStart(4, '0')}-${Date.now().toString(36).toUpperCase().slice(-4)}`
  const next: StoreOrder = {
    ...order,
    id,
    createdAt: new Date().toISOString(),
    status: order.status ?? 'pending',
  }
  orders.unshift(next)
  saveOrders(orders)
  return next
}

export function updateOrder(id: string, patch: Partial<StoreOrder>) {
  const raw = loadOrders()
  const i = raw.findIndex((o) => o.id === id)
  if (i < 0) return null
  const orders = raw.map((o, j) => (j === i ? { ...o, ...patch } : o))
  saveOrders(orders)
  return orders[i]!
}

export function ordersForCustomer(customerId: string): StoreOrder[] {
  return loadOrders().filter((o) => o.customerId === customerId)
}

export function ordersForOutlet(_outletId?: string): StoreOrder[] {
  return loadOrders()
}

export function orderByIdForCustomer(orderId: string, customerId: string): StoreOrder | null {
  const o = loadOrders().find((x) => x.id === orderId)
  if (!o || o.customerId !== customerId) return null
  return o
}
