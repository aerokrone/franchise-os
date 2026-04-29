/** Mock registered customers for HQ Admin & Outlet Manager directory */

export type RegisteredCustomer = {
  id: string
  name: string
  phone: string
  tier: string
  joined: string
  visits: number
  lifetimeSpend: string
  points: string
  initials: string
}

export type PurchaseLine = { sku: string; name: string; qty: number; lineTotal: number }

export type PurchaseRecord = {
  id: string
  date: string
  outlet: string
  amount: number
  points: string
  type: 'earn' | 'redeem'
  lines?: PurchaseLine[]
}

export const REGISTERED_CUSTOMERS: RegisteredCustomer[] = [
  {
    id: 'c1',
    name: 'Sarah Lim Wei Ling',
    phone: '+60 12-345 6789',
    tier: 'SILVER',
    joined: 'Mar 2024',
    visits: 47,
    lifetimeSpend: 'RM 4,847',
    points: '2,150',
    initials: 'SL',
  },
  {
    id: 'c2',
    name: 'Ahmad Zulkifli',
    phone: '+60 19-887 3210',
    tier: 'GOLD',
    joined: 'Jan 2023',
    visits: 82,
    lifetimeSpend: 'RM 9,120',
    points: '5,400',
    initials: 'AZ',
  },
  {
    id: 'c3',
    name: 'Priya Sharma',
    phone: '+60 16-442 9911',
    tier: 'BRONZE',
    joined: 'Aug 2025',
    visits: 12,
    lifetimeSpend: 'RM 892',
    points: '420',
    initials: 'PS',
  },
  {
    id: 'c4',
    name: 'Lee Wei Hao',
    phone: '+60 11-200 8844',
    tier: 'SILVER',
    joined: 'Nov 2024',
    visits: 28,
    lifetimeSpend: 'RM 3,204',
    points: '1,890',
    initials: 'LW',
  },
]

const HISTORY: Record<string, PurchaseRecord[]> = {
  c1: [
    {
      id: 't1',
      date: 'Today, 14:23',
      outlet: 'Mid Valley',
      amount: 1205,
      points: '+1,807',
      type: 'earn',
      lines: [
        { sku: 'CP-001', name: 'Ergonomic Wireless Mouse', qty: 2, lineTotal: 158 },
        { sku: 'MB-002', name: 'Fitness Smartwatch SE', qty: 2, lineTotal: 798 },
        { sku: 'AU-001', name: 'True Wireless Earbuds Pro', qty: 1, lineTotal: 249 },
      ],
    },
    {
      id: 't2',
      date: '26 Apr, 12:15',
      outlet: 'KL Sentral',
      amount: 447,
      points: '+670',
      type: 'earn',
      lines: [{ sku: 'CP-002', name: 'USB-C 7-in-1 Hub', qty: 3, lineTotal: 447 }],
    },
    {
      id: 't3',
      date: '24 Apr, 19:42',
      outlet: 'Mid Valley',
      amount: -200,
      points: '-200',
      type: 'redeem',
      lines: [{ sku: 'REDEEM', name: 'Points redemption (voucher)', qty: 1, lineTotal: -200 }],
    },
    {
      id: 't4',
      date: '22 Apr, 13:08',
      outlet: '1 Utama',
      amount: 714,
      points: '+1,071',
      type: 'earn',
      lines: [
        { sku: 'CP-001', name: 'Ergonomic Wireless Mouse', qty: 4, lineTotal: 316 },
        { sku: 'AU-002', name: 'Portable Bluetooth Speaker', qty: 2, lineTotal: 398 },
      ],
    },
    {
      id: 't5',
      date: '19 Apr, 09:55',
      outlet: 'Mid Valley',
      amount: 714,
      points: '+1,071',
      type: 'earn',
      lines: [{ sku: 'MB-001', name: '10000mAh Power Bank', qty: 6, lineTotal: 714 }],
    },
  ],
  c2: [
    {
      id: 't1',
      date: '27 Apr, 18:02',
      outlet: 'KL Sentral',
      amount: 3666,
      points: '+5,499',
      type: 'earn',
      lines: [
        { sku: 'CP-001', name: 'Ergonomic Wireless Mouse', qty: 6, lineTotal: 474 },
        { sku: 'MB-002', name: 'Fitness Smartwatch SE', qty: 8, lineTotal: 3192 },
      ],
    },
    {
      id: 't2',
      date: '25 Apr, 11:40',
      outlet: 'Mid Valley',
      amount: 745,
      points: '+1,118',
      type: 'earn',
      lines: [{ sku: 'CP-002', name: 'USB-C 7-in-1 Hub', qty: 5, lineTotal: 745 }],
    },
  ],
  c3: [
    {
      id: 't1',
      date: '20 Apr, 16:11',
      outlet: 'Mid Valley',
      amount: 476,
      points: '+714',
      type: 'earn',
      lines: [{ sku: 'MB-001', name: '10000mAh Power Bank', qty: 4, lineTotal: 476 }],
    },
  ],
  c4: [
    {
      id: 't1',
      date: '28 Apr, 09:12',
      outlet: '1 Utama',
      amount: 996,
      points: '+1,494',
      type: 'earn',
      lines: [{ sku: 'AU-001', name: 'True Wireless Earbuds Pro', qty: 4, lineTotal: 996 }],
    },
    {
      id: 't2',
      date: '15 Apr, 14:33',
      outlet: 'Mid Valley',
      amount: 395,
      points: '+592',
      type: 'earn',
      lines: [{ sku: 'CP-001', name: 'Ergonomic Wireless Mouse', qty: 5, lineTotal: 395 }],
    },
  ],
}

export function getPurchaseHistory(customerId: string): PurchaseRecord[] {
  return HISTORY[customerId] ?? []
}

export function getCustomerById(id: string): RegisteredCustomer | undefined {
  return REGISTERED_CUSTOMERS.find((c) => c.id === id)
}
