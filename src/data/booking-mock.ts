/** Electronics retail franchise — bookable in-store services (mock). */

export type Outlet = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  region: string
}

export type ServiceCategory = 'Repair' | 'Setup' | 'Trade-in' | 'Protection' | 'Diagnostics'

export type FranchiseService = {
  id: string
  sku: string
  name: string
  description: string
  durationMin: number
  category: ServiceCategory
  price: number
  image: string
  /** HQ-level availability */
  active: boolean
}

export type BookingSource = 'customer_app' | 'pos'

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled'

export type ScheduledBooking = {
  id: string
  serviceId: string
  outletId: string
  dateISO: string
  time: string
  customerName: string
  customerPhone: string
  source: BookingSource
  status: BookingStatus
}

export const OUTLETS: Outlet[] = [
  {
    id: 'mv',
    name: 'Mid Valley Mega Mall',
    address: 'Lingkaran Syed Putra, Mid Valley City, 59200 KL',
    lat: 3.1182,
    lng: 101.6766,
    region: 'Klang Valley',
  },
  {
    id: '1u',
    name: '1 Utama Shopping Centre',
    address: '1 Utama, Bandar Utama, 47800 PJ',
    lat: 3.1478,
    lng: 101.6163,
    region: 'Klang Valley',
  },
  {
    id: 'kls',
    name: 'KL Sentral',
    address: 'KL Sentral, 50470 KL',
    lat: 3.1343,
    lng: 101.6863,
    region: 'Klang Valley',
  },
]

/** Mock customer “current location” (Bangsar) for nearest-outlet suggestion */
export const MOCK_CUSTOMER_LAT = 3.1291
export const MOCK_CUSTOMER_LNG = 101.6697

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la = (a.lat * Math.PI) / 180
  const lb = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)))
}

export function nearestOutlet(
  lat: number,
  lng: number,
  outlets: Outlet[] = OUTLETS,
): { outlet: Outlet; km: number } {
  let best = { outlet: outlets[0], km: Infinity }
  for (const o of outlets) {
    const km = distanceKm({ lat, lng }, { lat: o.lat, lng: o.lng })
    if (km < best.km) best = { outlet: o, km }
  }
  return best
}

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=440&fit=crop'

export const INITIAL_SERVICES: FranchiseService[] = [
  {
    id: 'svc-diag',
    sku: 'SRV-DG01',
    name: 'Device diagnostic & health check',
    description:
      'Full hardware scan, battery health, storage audit, and OS performance report — phones, tablets, laptops.',
    durationMin: 30,
    category: 'Diagnostics',
    price: 49,
    active: true,
    image: PLACEHOLDER_IMG,
  },
  {
    id: 'svc-screen',
    sku: 'SRV-SP02',
    name: 'Precision screen protector install',
    description: 'Tempered glass or film for phones/tablets · dust-free booth · bubble-free guarantee.',
    durationMin: 20,
    category: 'Protection',
    price: 35,
    active: true,
    image: PLACEHOLDER_IMG,
  },
  {
    id: 'svc-setup',
    sku: 'SRV-ST03',
    name: 'New device setup & data migration',
    description: 'Apple · Samsung · Xiaomi — iCloud/Google transfer, WhatsApp backup, account sign-in.',
    durationMin: 45,
    category: 'Setup',
    price: 89,
    active: true,
    image: PLACEHOLDER_IMG,
  },
  {
    id: 'svc-laptop',
    sku: 'SRV-LP04',
    name: 'Gaming laptop tune-up',
    description: 'Thermal paste, fan clean, SSD health, driver stack — ASUS / Lenovo Legion / Alienware.',
    durationMin: 60,
    category: 'Repair',
    price: 129,
    active: true,
    image: PLACEHOLDER_IMG,
  },
  {
    id: 'svc-trade',
    sku: 'SRV-TR05',
    name: 'Trade-in appraisal appointment',
    description: 'On-site IMEI/device grading for phones & wearables toward store credit.',
    durationMin: 25,
    category: 'Trade-in',
    price: 0,
    active: true,
    image: PLACEHOLDER_IMG,
  },
  {
    id: 'svc-repair-intake',
    sku: 'SRV-RP06',
    name: 'Manufacturer repair intake',
    description: 'RMA ticketing for authorised warranty repairs — laptops, earbuds, consoles.',
    durationMin: 40,
    category: 'Repair',
    price: 59,
    active: true,
    image: PLACEHOLDER_IMG,
  },
]

export const TIME_SLOTS = (() => {
  const slots: string[] = []
  for (let h = 10; h <= 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 18) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})()

function daysFromMonday(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/** Monday 00:00 local for the week that contains `d` */
export function weekStartsFrom(d: Date): Date {
  return daysFromMonday(d)
}

/** ISO yyyy-mm-dd in local TZ */
export function formatDateISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Next N calendar days starting from today */
export function nextDates(count: number, from = new Date()): string[] {
  const list: string[] = []
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    list.push(formatDateISO(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return list
}

/** Initial scheduled bookings spanning outlets (for manager calendar). */
export function seedBookings(): ScheduledBooking[] {
  const today = new Date()
  const w0 = daysFromMonday(today)
  const d0 = formatDateISO(new Date(w0.getTime()))
  const d1 = formatDateISO(new Date(w0.getFullYear(), w0.getMonth(), w0.getDate() + 2))
  const d2 = formatDateISO(new Date(w0.getFullYear(), w0.getMonth(), w0.getDate() + 4))

  return [
    {
      id: 'bk-seed-1',
      serviceId: 'svc-diag',
      outletId: 'mv',
      dateISO: d0,
      time: '11:00',
      customerName: 'Sarah Lim Wei Ling',
      customerPhone: '+60 12-345 6789',
      source: 'customer_app',
      status: 'confirmed',
    },
    {
      id: 'bk-seed-2',
      serviceId: 'svc-setup',
      outletId: 'mv',
      dateISO: d0,
      time: '14:30',
      customerName: 'Walk-in',
      customerPhone: '+60 16-889 9012',
      source: 'pos',
      status: 'confirmed',
    },
    {
      id: 'bk-seed-3',
      serviceId: 'svc-laptop',
      outletId: '1u',
      dateISO: d1,
      time: '15:00',
      customerName: 'Priya Nair',
      customerPhone: '+60 19-772 4411',
      source: 'customer_app',
      status: 'confirmed',
    },
    {
      id: 'bk-seed-4',
      serviceId: 'svc-trade',
      outletId: 'kls',
      dateISO: d2,
      time: '10:30',
      customerName: 'Marcus Tee',
      customerPhone: '+60 11-220 9933',
      source: 'pos',
      status: 'confirmed',
    },
  ]
}

/** Per-outlet toggle: service id → offered at POS / customer booking */
export type OutletServicesMap = Record<string, Record<string, boolean>>

export function seedOutletServicesMap(): OutletServicesMap {
  const m: OutletServicesMap = {}
  const ids = INITIAL_SERVICES.map((s) => s.id)
  for (const o of OUTLETS) {
    m[o.id] = {}
    for (const sid of ids) {
      m[o.id][sid] = true
    }
    // Simulate one service off at one outlet
    if (o.id === '1u') {
      m[o.id]['svc-repair-intake'] = false
    }
  }
  return m
}
