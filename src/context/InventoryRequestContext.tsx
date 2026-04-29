import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { HQ_TABLE, NETWORK_OUTLETS } from '../data/inventory-mock'

export type InventoryRequestLine = {
  sku: string
  name: string
  qty: number
}

export type InventoryRequest = {
  id: string
  code: string
  outletId: string
  outletName: string
  lines: InventoryRequestLine[]
  /** ISO timestamp */
  createdAt: string
  status: 'pending_hq' | 'approved'
}

function outletLabel(id: string): string {
  return NETWORK_OUTLETS.find((o) => o.id === id)?.name ?? id
}

function makeCode(outletId: string, sequence: number): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const slug = outletId.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'OUT'
  return `REQ-${y}${m}${day}-${slug}-${String(sequence).padStart(3, '0')}`
}

function seedPending(): InventoryRequest[] {
  const r0 = HQ_TABLE[0]
  const r1 = HQ_TABLE[2]
  const r2 = HQ_TABLE[5]
  const r3 = HQ_TABLE[8]
  const now = Date.now()
  return [
    {
      id: 'seed-req-mv-1',
      code: 'REQ-20260427-MV-001',
      outletId: 'mv',
      outletName: outletLabel('mv'),
      lines: [
        { sku: r0.sku, name: r0.name, qty: 48 },
        { sku: r1.sku, name: r1.name, qty: 12 },
      ],
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      status: 'pending_hq',
    },
    {
      id: 'seed-req-1u-1',
      code: 'REQ-20260428-1U-002',
      outletId: '1u',
      outletName: outletLabel('1u'),
      lines: [{ sku: r2.sku, name: r2.name, qty: 36 }],
      createdAt: new Date(now - 86400000).toISOString(),
      status: 'pending_hq',
    },
    {
      id: 'seed-req-kls-1',
      code: 'REQ-20260429-KLS-003',
      outletId: 'kls',
      outletName: outletLabel('kls'),
      lines: [
        { sku: r3.sku, name: r3.name, qty: 20 },
        { sku: r0.sku, name: r0.name, qty: 8 },
      ],
      createdAt: new Date(now - 3600000 * 5).toISOString(),
      status: 'pending_hq',
    },
  ]
}

type InventoryRequestCtx = {
  requests: InventoryRequest[]
  pendingForHq: InventoryRequest[]
  requestsForOutlet: (outletId: string) => InventoryRequest[]
  submitRequest: (outletId: string, outletName: string, lines: InventoryRequestLine[]) => InventoryRequest
  approveRequest: (requestId: string) => void
}

const InventoryRequestContext = createContext<InventoryRequestCtx | null>(null)

export function InventoryRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<InventoryRequest[]>(() => seedPending())

  const pendingForHq = useMemo(
    () => requests.filter((r) => r.status === 'pending_hq').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests],
  )

  const requestsForOutlet = useCallback(
    (outletId: string) =>
      requests
        .filter((r) => r.outletId === outletId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests],
  )

  const submitRequest = useCallback((outletId: string, outletName: string, lines: InventoryRequestLine[]) => {
    const cleaned = lines
      .filter((l) => l.qty > 0)
      .map((l) => ({ sku: l.sku, name: l.name, qty: Math.floor(l.qty) }))
    let created!: InventoryRequest
    setRequests((prev) => {
      const maxSeq = prev.reduce((acc, r) => {
        const m = r.code.match(/-(\d{3})$/)
        return Math.max(acc, m ? parseInt(m[1], 10) : 0)
      }, 0)
      created = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        code: makeCode(outletId, maxSeq + 1),
        outletId,
        outletName,
        lines: cleaned,
        createdAt: new Date().toISOString(),
        status: 'pending_hq',
      }
      return [created, ...prev]
    })
    return created
  }, [])

  const approveRequest = useCallback((requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r)),
    )
  }, [])

  const value = useMemo(
    () => ({
      requests,
      pendingForHq,
      requestsForOutlet,
      submitRequest,
      approveRequest,
    }),
    [requests, pendingForHq, requestsForOutlet, submitRequest, approveRequest],
  )

  return (
    <InventoryRequestContext.Provider value={value}>{children}</InventoryRequestContext.Provider>
  )
}

export function useInventoryRequests() {
  const ctx = useContext(InventoryRequestContext)
  if (!ctx) throw new Error('useInventoryRequests requires InventoryRequestProvider')
  return ctx
}
