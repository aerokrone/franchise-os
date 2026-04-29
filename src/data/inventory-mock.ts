import content from './content-details.json'
import { getCatalogProducts, type CatalogProduct } from './catalog'

export type HqInventoryRow = {
  sku: string
  name: string
  cat: string
  hq: number
  allocated: number
  outbound: number
  nextShip: string
  stockedOutletIds: string[]
}

export type OutletInventoryRow = {
  sku: string
  name: string
  cat: string
  onHand: number
  minimum: number
}

export const NETWORK_OUTLETS = [
  { id: 'mv', name: 'Mid Valley' },
  { id: 'kls', name: 'KL Sentral' },
  { id: '1u', name: '1 Utama' },
  { id: 'pen', name: 'Penang · Gurney' },
] as const

const stockTableEl = content.pages.inventory.elements.find((e) => e.id === 'stock-table') as {
  content: {
    rows: { sku: string; name: string; available: number; threshold: number }[]
  }
}

function hashSku(sku: string, salt: number) {
  let h = salt
  for (let i = 0; i < sku.length; i++) h = (h + sku.charCodeAt(i) * (i + 1)) % 9973
  return h
}

const catBySku = new Map(getCatalogProducts().map((p) => [p.sku, p.cat]))

const outletSubset: OutletInventoryRow[] = stockTableEl.content.rows.map((r) => ({
  sku: r.sku,
  name: r.name,
  cat: catBySku.get(r.sku) ?? 'General',
  onHand: r.available,
  minimum: r.threshold,
}))

function buildHqRow(p: CatalogProduct, outletRows: OutletInventoryRow[]): HqInventoryRow {
  const out = outletRows.find((r) => r.sku === p.sku)
  const baseOnHand = out?.onHand ?? p.stock
  const h = hashSku(p.sku, 7)
  const hq = Math.max(120, baseOnHand * 12 + (h % 400))
  const allocated = Math.floor(hq * (0.08 + (h % 17) / 200))
  const outbound = Math.floor(hq * (0.02 + (h % 11) / 300))

  const stockedOutletIds = NETWORK_OUTLETS.filter((_, idx) => (hashSku(p.sku, idx + 1) % 3) !== 0).map(
    (o) => o.id,
  )
  if (!stockedOutletIds.includes('mv')) stockedOutletIds.unshift('mv')

  const day = 28 + (h % 4)
  const nextShip = `Apr ${day} · ${6 + (h % 12)}:00–${10 + (h % 8)}:00`

  return {
    sku: p.sku,
    name: p.name,
    cat: p.cat,
    hq,
    allocated,
    outbound,
    nextShip,
    stockedOutletIds,
  }
}

const allProducts = getCatalogProducts()

export const OUTLET_ROWS: OutletInventoryRow[] = allProducts.map((p) => {
  const hit = outletSubset.find((r) => r.sku === p.sku)
  if (hit) return hit
  return {
    sku: p.sku,
    name: p.name,
    cat: p.cat,
    onHand: p.stock,
    minimum: p.lowStock ? Math.max(8, Math.floor(p.stock * 1.2)) : 12,
  }
})

export const HQ_TABLE: HqInventoryRow[] = allProducts.map((p) => buildHqRow(p, OUTLET_ROWS))
