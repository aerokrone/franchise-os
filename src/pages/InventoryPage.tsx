import {
  AlertTriangle,
  ArrowDownToLine,
  Package,
  Search,
  Store,
  Truck,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import content from '../data/content-details.json'
import { getCatalogProducts } from '../data/catalog'
import { HQ_TABLE, NETWORK_OUTLETS, OUTLET_ROWS } from '../data/inventory-mock'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import {
  OutletVelocityLineChart,
  type VelocityDayPoint,
} from '../components/OutletVelocityLineChart'
import { useSession } from '../context/SessionContext'

type InvPage = (typeof content.pages)['inventory'] & {
  moduleTitlerowOutlet?: { lead: string }
  moduleTitlerowHq?: { lead: string }
}

const inv = content.pages.inventory as InvPage

type SummaryCard = { label: string; value: string; subtext: string }

const HQ_KPIS: SummaryCard[] = [
  {
    label: 'Central on hand',
    value: '48.2k',
    subtext: 'units at HQ warehouse · 87 SKUs',
  },
  {
    label: 'Allocated to outlets',
    value: '12.4k',
    subtext: 'soft-reserved for next wave',
  },
  {
    label: 'In transit – network',
    value: '812',
    subtext: '6 active dispatch runs',
  },
  {
    label: 'Critical at any outlet',
    value: '11',
    subtext: 'SKUs below outlet par',
  },
]

type SalesByOutletRow = {
  product: string
  sku: string
  midValley: number
  klSentral: number
  oneUtama: number
  penang: number
}

/** Rolling-window outlet totals — used to synthesize daily pacing (catalogue aggregate mock). */
const SALES_BY_OUTLET: SalesByOutletRow[] = getCatalogProducts().map((p, i) => {
  const seed = (p.sku.replace(/\D/g, '') || '42').slice(0, 3)
  const n = parseInt(seed.padEnd(3, '1'), 10) || 420
  return {
    product: p.name,
    sku: p.sku,
    midValley: 280 + (n % 900) + i * 71,
    klSentral: 200 + (n % 700) + i * 53,
    oneUtama: 160 + (n % 600) + i * 41,
    penang: 110 + (n % 500) + i * 37,
  }
})

/** Maps dashboard-style range tabs → calendar days (mock YTD = 120d window). */
const VELOCITY_RANGE_DAYS = {
  Today: 1,
  Week: 7,
  Month: 30,
  YTD: 120,
} as const

const VELOCITY_RANGE_ORDER: (keyof typeof VELOCITY_RANGE_DAYS)[] = ['Today', 'Week', 'Month', 'YTD']

/** One point per calendar day — mocks daily units sold per outlet from SKU roll-ups (weighted pacing). */
function buildOutletDailyVelocitySeries(
  rows: SalesByOutletRow[],
  dayCount: number,
): VelocityDayPoint[] {
  const totals = {
    midValley: rows.reduce((s, r) => s + r.midValley, 0),
    klSentral: rows.reduce((s, r) => s + r.klSentral, 0),
    oneUtama: rows.reduce((s, r) => s + r.oneUtama, 0),
    penang: rows.reduce((s, r) => s + r.penang, 0),
  }
  const rawWeights = Array.from({ length: dayCount }, (_, i) => {
    const dow = (i + 3) % 7
    const weekend = dow === 0 || dow === 6 ? 0.82 : 1
    const wave1 = 0.88 + 0.12 * Math.sin((i / dayCount) * Math.PI * 2)
    const wave2 = 0.06 * Math.sin((i / dayCount) * Math.PI * 6)
    const wave3 = 0.05 * Math.sin(i * 0.31 + 2.1)
    const intra = 0.96 + (((i * 17) % 11) / 110)
    const holidayBlip = i % 28 === 0 ? 1.06 : i % 19 === 3 ? 0.93 : 1
    return weekend * holidayBlip * intra * (wave1 + wave2 + wave3) * 0.55
  })
  const wSum = rawWeights.reduce((a, b) => a + b, 0)
  const weights = rawWeights.map((w) => w / wSum)

  const anchor = new Date(2026, 3, 28)
  const dateOpts: Intl.DateTimeFormatOptions =
    dayCount > 45
      ? { month: 'short', day: 'numeric', year: '2-digit' }
      : { month: 'short', day: 'numeric' }

  return weights.map((w, i) => {
    const d = new Date(anchor)
    d.setDate(d.getDate() - (dayCount - 1 - i))
    return {
      label: d.toLocaleDateString('en-MY', dateOpts),
      midValley: Math.max(0, Math.round(totals.midValley * w)),
      klSentral: Math.max(0, Math.round(totals.klSentral * w)),
      oneUtama: Math.max(0, Math.round(totals.oneUtama * w)),
      penang: Math.max(0, Math.round(totals.penang * w)),
    }
  })
}

type SummaryEl = (typeof inv.elements)[number] & {
  cards: { label: string; value: string; subtext: string }[]
}

const outletIcons = [Package, ArrowDownToLine, AlertTriangle]

export function InventoryPage() {
  const { role } = useSession()

  if (role === 'hq_admin') {
    return <InventoryHqWarehouse />
  }

  const summaryEl = inv.elements.find((e) => e.id === 'inventory-summary')! as SummaryEl

  return (
    <div className="stack-page outlet-inventory">
      <ModuleTitlerow
        lead={inv.moduleTitlerowOutlet?.lead ?? 'Stock'}
        meta={
          <>
            <b>{OUTLET_ROWS.length}</b> SKUs ·{' '}
            <b>{OUTLET_ROWS.filter((r) => r.onHand <= r.minimum).length}</b> at/below par · Request from HQ
          </>
        }
      />
      <section className="kpis">
        {(summaryEl.cards.slice(0, 3)).map((c, i) => {
          const Ico = outletIcons[i] ?? Package
          const subtext =
            i === 0 ? c.subtext.replace(/\b87\b/, String(OUTLET_ROWS.length)) : c.subtext
          return (
            <article key={c.label} className="kpi tone-green">
              <div className="kpi-head">
                <div className="kpi-icon">
                  <Ico size={18} strokeWidth={2} />
                </div>
                <span className="kpi-label">{c.label}</span>
              </div>
              <div className="kpi-value">{c.value}</div>
              <div className="kpi-foot">
                <span className="kpi-sub">{subtext}</span>
              </div>
            </article>
          )
        })}
      </section>

      <OutletStockTable />
    </div>
  )
}

function InventoryHqWarehouse() {
  const icons = [Package, Store, Truck, AlertTriangle]
  const [velocityRange, setVelocityRange] = useState<keyof typeof VELOCITY_RANGE_DAYS>('Week')
  const [hqQuery, setHqQuery] = useState('')
  const [hqCat, setHqCat] = useState('All')
  const [hqOutlet, setHqOutlet] = useState<string>('all')

  const hqCategories = useMemo(() => {
    const s = new Set(HQ_TABLE.map((r) => r.cat))
    return ['All', ...Array.from(s).sort()]
  }, [])

  const filteredHq = useMemo(() => {
    const q = hqQuery.trim().toLowerCase()
    return HQ_TABLE.filter((r) => {
      const okCat = hqCat === 'All' || r.cat === hqCat
      const okQ = !q || r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q)
      const okOutlet = hqOutlet === 'all' || r.stockedOutletIds.includes(hqOutlet)
      return okCat && okQ && okOutlet
    })
  }, [hqQuery, hqCat, hqOutlet])

  const outletDailyVelocity = useMemo(
    () =>
      buildOutletDailyVelocitySeries(SALES_BY_OUTLET, VELOCITY_RANGE_DAYS[velocityRange]),
    [velocityRange],
  )

  return (
    <div className="stack-page hq-inventory">
      <ModuleTitlerow lead={inv.moduleTitlerowHq?.lead ?? 'Inventory'} />
      <section className="kpis">
        {HQ_KPIS.map((c, i) => {
          const Ico = icons[i] ?? Package
          return (
            <article key={c.label} className="kpi tone-green">
              <div className="kpi-head">
                <div className="kpi-icon">
                  <Ico size={18} strokeWidth={2} />
                </div>
                <span className="kpi-label">{c.label}</span>
              </div>
              <div className="kpi-value">{c.value}</div>
              <div className="kpi-foot">
                <span className="kpi-sub">{c.subtext}</span>
              </div>
            </article>
          )
        })}
      </section>

      <article className="panel">
        <div className="outlets-head outlets-head--range">
          <div>
            <div className="panel-title">Sales velocity</div>
            <div className="panel-sub">
              Daily units sold per outlet — one mock point per calendar day · scales to container width
            </div>
          </div>
          <div className="range-tabs" aria-label="Velocity time range">
            {VELOCITY_RANGE_ORDER.map((r) => (
              <button
                key={r}
                type="button"
                className={velocityRange === r ? 'on' : ''}
                onClick={() => setVelocityRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <OutletVelocityLineChart data={outletDailyVelocity} />
      </article>

      <article className="panel">
        <div className="outlets-head">
          <div>
            <div className="panel-title">All Inventory</div>
            <div className="panel-sub">
              Central DC balances for every catalogue SKU (mock data) · {filteredHq.length} of {HQ_TABLE.length} shown
            </div>
          </div>
        </div>
        <div className="inv-hq-toolbar">
          <label className="inv-hq-search">
            <Search size={18} strokeWidth={2} aria-hidden />
            <input
              type="search"
              placeholder="Search product or SKU…"
              value={hqQuery}
              onChange={(e) => setHqQuery(e.target.value)}
              aria-label="Filter HQ inventory"
            />
          </label>
          <select
            className="inv-hq-select"
            value={hqOutlet}
            onChange={(e) => setHqOutlet(e.target.value)}
            aria-label="Outlet filter"
          >
            <option value="all">All outlets</option>
            {NETWORK_OUTLETS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            className="inv-hq-select"
            value={hqCat}
            onChange={(e) => setHqCat(e.target.value)}
            aria-label="Category filter"
          >
            {hqCategories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="outlets">
            <thead>
              <tr>
                <th>Product</th>
                <th className="r">HQ on hand</th>
                <th className="r">Allocated</th>
                <th className="r">Staging out</th>
                <th>Next ship window</th>
              </tr>
            </thead>
            <tbody>
              {filteredHq.map((r) => (
                <tr key={r.sku}>
                  <td className="lead">
                    <Link to={`/inventory/${encodeURIComponent(r.sku)}`} className="inv-cell-link">
                      <div className="outlet-name">{r.name}</div>
                      <div className="outlet-region">{r.sku}</div>
                    </Link>
                  </td>
                  <td className="r">{r.hq.toLocaleString()}</td>
                  <td className="r">{r.allocated.toLocaleString()}</td>
                  <td className="r">{r.outbound.toLocaleString()}</td>
                  <td>{r.nextShip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

function OutletStockTable() {
  const [requested, setRequested] = useState<Record<string, true>>({})
  const [msg, setMsg] = useState<string | null>(null)

  const request = (sku: string, name: string) => {
    setRequested((p) => ({ ...p, [sku]: true }))
    setMsg(`Restock queued for HQ: ${sku} (${name}). Ref will appear in Replenishments.`)
    window.setTimeout(() => setMsg(null), 5000)
  }

  return (
    <>
      {msg ? (
        <aside className="toast-inline" role="status">
          {msg}
        </aside>
      ) : null}
      <article className="panel">
        <div className="outlets-head">
          <div>
            <div className="panel-title">All outlet inventory</div>
            <div className="panel-sub">
              Every catalogue SKU stocked at this outlet — on-hand vs par · request from HQ when needed.
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="outlets">
            <thead>
              <tr>
                <th>Product</th>
                <th className="r">On hand</th>
                <th className="r">Minimum</th>
                <th>Status</th>
                <th className="r">Replenishment</th>
              </tr>
            </thead>
            <tbody>
              {OUTLET_ROWS.map((r) => {
                const low = r.onHand <= r.minimum
                const pending = Boolean(requested[r.sku])
                return (
                  <tr key={r.sku}>
                    <td className="lead">
                      <Link to={`/inventory/${encodeURIComponent(r.sku)}`} className="inv-cell-link">
                        <div className="outlet-name">{r.name}</div>
                        <div className="outlet-region">{r.sku}</div>
                      </Link>
                    </td>
                    <td
                      className="r"
                      style={{ color: low ? 'var(--tone-lava)' : undefined }}
                    >
                      {r.onHand}
                    </td>
                    <td className="r">{r.minimum}</td>
                    <td>
                      {low ? (
                        <span className="nav-tag inv-tag-alert">Below par</span>
                      ) : (
                        <span className="muted">OK</span>
                      )}
                    </td>
                    <td className="r">
                      <button
                        type="button"
                        className="mini-btn-inv"
                        disabled={pending}
                        onClick={() => request(r.sku, r.name)}
                      >
                        {pending ? 'Requested' : 'Request from HQ'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>
    </>
  )
}
