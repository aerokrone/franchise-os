import {
  AlertTriangle,
  ArrowDownToLine,
  ClipboardCheck,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import content from '../data/content-details.json'
import { getCatalogProducts } from '../data/catalog'
import { HQ_TABLE, NETWORK_OUTLETS, OUTLET_ROWS } from '../data/inventory-mock'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import {
  OutletVelocityLineChart,
  type VelocityDayPoint,
} from '../components/OutletVelocityLineChart'
import type { InventoryRequestLine } from '../context/InventoryRequestContext'
import { useInventoryRequests } from '../context/InventoryRequestContext'
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

function fmtReqTs(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function InvScopeTabs({
  value,
  onChange,
  tabs,
}: {
  value: string
  onChange: (id: string) => void
  tabs: { id: string; label: string }[]
}) {
  return (
    <div className="inv-scope-tabs" role="tablist" aria-label="Inventory scope">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={`inv-scope-tab${value === t.id ? ' inv-scope-tab--on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function HqRequestedPanel() {
  const { pendingForHq, approveRequest } = useInventoryRequests()

  return (
    <article className="panel inv-req-panel">
      <div className="outlets-head">
        <div>
          <div className="panel-title">Requested items · outlet replenishments</div>
          <div className="panel-sub">
            Each row is one consolidated request from an outlet manager · approve to release allocation (mock).
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="outlets inv-req-table">
          <thead>
            <tr>
              <th>Request code</th>
              <th>Outlet</th>
              <th>Items requested</th>
              <th className="r">Lines</th>
              <th className="r">Total qty</th>
              <th>Submitted</th>
              <th className="r">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingForHq.length === 0 ? (
              <tr>
                <td colSpan={7} className="inv-req-empty">
                  No pending outlet requests — you&apos;re caught up.
                </td>
              </tr>
            ) : (
              pendingForHq.map((req) => {
                const lines = req.lines.length
                const units = req.lines.reduce((s, l) => s + l.qty, 0)
                return (
                  <tr key={req.id}>
                    <td className="lead">
                      <span className="inv-req-code">{req.code}</span>
                    </td>
                    <td>
                      <div className="outlet-name">{req.outletName}</div>
                      <div className="outlet-region muted">{req.outletId}</div>
                    </td>
                    <td className="inv-req-lines-cell">
                      <ul className="inv-req-lines">
                        {req.lines.map((l) => (
                          <li key={l.sku}>
                            <span className="inv-req-li-name">{l.name}</span>
                            <span className="muted"> · {l.sku}</span>
                            <span className="inv-req-li-qty"> × {l.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="r">{lines}</td>
                    <td className="r mono-ish">{units.toLocaleString()}</td>
                    <td>{fmtReqTs(req.createdAt)}</td>
                    <td className="r">
                      <button
                        type="button"
                        className="btn btn-primary inv-req-approve"
                        onClick={() => approveRequest(req.id)}
                      >
                        <ClipboardCheck width={16} strokeWidth={2} aria-hidden />
                        Approve
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export function InventoryPage() {
  const { role } = useSession()

  if (role === 'hq_admin') {
    return <InventoryHqWarehouse />
  }

  if (role === 'outlet_manager') {
    return <OutletManagerInventory />
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

      <OutletStockTable variant="staff" />
    </div>
  )
}

function OutletManagerInventory() {
  const { managedOutlet } = useSession()
  const { submitRequest, requestsForOutlet } = useInventoryRequests()

  const outletId = managedOutlet?.id ?? 'mv'
  const outletName = managedOutlet?.name ?? 'Outlet'

  const summaryEl = inv.elements.find((e) => e.id === 'inventory-summary')! as SummaryEl

  const [scope, setScope] = useState<'all' | 'request'>('all')
  const [draft, setDraft] = useState<InventoryRequestLine[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const history = requestsForOutlet(outletId)

  const mergeLine = (line: InventoryRequestLine) => {
    setDraft((prev) => {
      const i = prev.findIndex((l) => l.sku === line.sku)
      if (i < 0) return [...prev, line]
      const next = [...prev]
      next[i] = { ...next[i], qty: next[i].qty + line.qty }
      return next
    })
  }

  const removeLine = (sku: string) => {
    setDraft((prev) => prev.filter((l) => l.sku !== sku))
  }

  const setLineQty = (sku: string, qty: number) => {
    const q = Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1))
    setDraft((prev) => prev.map((l) => (l.sku === sku ? { ...l, qty: q } : l)))
  }

  const submitDraft = () => {
    if (draft.length === 0) return
    const req = submitRequest(outletId, outletName, draft)
    setDraft([])
    setToast(
      `Submitted ${req.code} · ${req.lines.length} line${req.lines.length > 1 ? 's' : ''} · ${req.lines.reduce((s, l) => s + l.qty, 0)} units`,
    )
    window.setTimeout(() => setToast(null), 5600)
  }

  const draftSkuSet = useMemo(() => new Set(draft.map((l) => l.sku)), [draft])

  return (
    <div className="stack-page outlet-inventory outlet-inventory--manager">
      <ModuleTitlerow
        lead={inv.moduleTitlerowOutlet?.lead ?? 'Stock'}
        meta={
          <>
            <b>{OUTLET_ROWS.length}</b> SKUs · Draft replenishments compile into{' '}
            <b>one request code</b> per submission · HQ reviews queue
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

      <InvScopeTabs
        value={scope}
        onChange={(id) => setScope(id as 'all' | 'request')}
        tabs={[
          { id: 'all', label: 'All inventory' },
          { id: 'request', label: 'Request' },
        ]}
      />

      {toast ? (
        <aside className="toast-inline inv-manager-toast" role="status">
          {toast}
        </aside>
      ) : null}

      {scope === 'all' ? (
        <OutletStockTable variant="manager" draftSkus={draftSkuSet} onMergeLine={mergeLine} />
      ) : (
        <>
          <article className="panel inv-draft-panel">
            <div className="outlets-head">
              <div>
                <div className="panel-title">Requested Items</div>
                <div className="panel-sub">
                  Items added from <strong>All inventory</strong> gather here · everything below submits as{' '}
                  <strong>one request</strong> with a single code for HQ.
                </div>
              </div>
            </div>

            {draft.length === 0 ? (
              <p className="inv-draft-empty muted">
                Nothing in this draft yet. Switch to <strong>All inventory</strong>, set quantities, and choose{' '}
                <strong>Add to request</strong>.
              </p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="outlets inv-draft-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="r">Qty</th>
                        <th className="r">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.map((l) => (
                        <tr key={l.sku}>
                          <td className="lead">
                            <Link to={`/inventory/${encodeURIComponent(l.sku)}`} className="inv-cell-link">
                              <div className="outlet-name">{l.name}</div>
                              <div className="outlet-region">{l.sku}</div>
                            </Link>
                          </td>
                          <td className="r">
                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="inv-draft-qty"
                              value={l.qty}
                              onChange={(e) => setLineQty(l.sku, Number(e.target.value))}
                              aria-label={`Quantity for ${l.name}`}
                            />
                          </td>
                          <td className="r">
                            <button
                              type="button"
                              className="inv-draft-remove"
                              onClick={() => removeLine(l.sku)}
                              aria-label={`Remove ${l.name}`}
                            >
                              <Trash2 width={16} strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="inv-draft-submit-row">
                  <button type="button" className="btn btn-primary inv-draft-submit" onClick={submitDraft}>
                    Submit request to HQ
                  </button>
                  <span className="muted inv-draft-meta">
                    {draft.length} SKU{draft.length !== 1 ? 's' : ''} ·{' '}
                    {draft.reduce((s, l) => s + l.qty, 0)} units total
                  </span>
                </div>
              </>
            )}
          </article>

          <article className="panel inv-history-panel">
            <div className="outlets-head">
              <div>
                <div className="panel-title">Your submitted requests</div>
                <div className="panel-sub">
                  One row per submission · multiple SKUs roll into the same request code.
                </div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="outlets inv-req-table">
                <thead>
                  <tr>
                    <th>Request code</th>
                    <th>Items</th>
                    <th className="r">Total qty</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="inv-req-empty">
                        No requests from this outlet yet.
                      </td>
                    </tr>
                  ) : (
                    history.map((req) => {
                      const units = req.lines.reduce((s, l) => s + l.qty, 0)
                      return (
                        <tr key={req.id}>
                          <td className="lead">
                            <span className="inv-req-code">{req.code}</span>
                          </td>
                          <td className="inv-req-lines-cell">
                            <ul className="inv-req-lines inv-req-lines--compact">
                              {req.lines.map((l) => (
                                <li key={l.sku}>
                                  {l.name} <span className="muted">× {l.qty}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="r mono-ish">{units.toLocaleString()}</td>
                          <td>
                            {req.status === 'pending_hq' ? (
                              <span className="inv-status inv-status--pending">Pending HQ</span>
                            ) : (
                              <span className="inv-status inv-status--ok">Approved</span>
                            )}
                          </td>
                          <td>{fmtReqTs(req.createdAt)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </div>
  )
}

function InventoryHqWarehouse() {
  const icons = [Package, Store, Truck, AlertTriangle]
  const [hqScope, setHqScope] = useState<'all' | 'requests'>('all')
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

      <InvScopeTabs
        value={hqScope}
        onChange={(id) => setHqScope(id as 'all' | 'requests')}
        tabs={[
          { id: 'all', label: 'All inventory' },
          { id: 'requests', label: 'Requested items' },
        ]}
      />

      {hqScope === 'requests' ? (
        <HqRequestedPanel />
      ) : (
        <>
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
                  Central DC balances for every catalogue SKU (mock data) · {filteredHq.length} of {HQ_TABLE.length}{' '}
                  shown
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
        </>
      )}
    </div>
  )
}

function OutletStockTable({
  variant,
  draftSkus,
  onMergeLine,
}: {
  variant: 'staff' | 'manager'
  draftSkus?: Set<string>
  onMergeLine?: (line: InventoryRequestLine) => void
}) {
  const [requested, setRequested] = useState<Record<string, true>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const [qtyModalRow, setQtyModalRow] = useState<{ sku: string; name: string } | null>(null)
  const [modalQty, setModalQty] = useState(1)

  useEffect(() => {
    if (!qtyModalRow) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQtyModalRow(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [qtyModalRow])

  const requestStaff = (sku: string, name: string) => {
    setRequested((p) => ({ ...p, [sku]: true }))
    setMsg(`Restock queued for HQ: ${sku} (${name}). Ref will appear in Replenishments.`)
    window.setTimeout(() => setMsg(null), 5000)
  }

  const openQtyModal = (r: (typeof OUTLET_ROWS)[number]) => {
    setModalQty(1)
    setQtyModalRow({ sku: r.sku, name: r.name })
  }

  const confirmQtyModal = () => {
    if (!qtyModalRow || !onMergeLine) return
    const q = Math.max(1, Math.floor(Number.isFinite(modalQty) ? modalQty : 1))
    onMergeLine({ sku: qtyModalRow.sku, name: qtyModalRow.name, qty: q })
    setQtyModalRow(null)
  }

  const managerMode = variant === 'manager'

  return (
    <>
      {msg && variant === 'staff' ? (
        <aside className="toast-inline" role="status">
          {msg}
        </aside>
      ) : null}
      <article className="panel">
        <div className="outlets-head">
          <div>
            <div className="panel-title">All outlet inventory</div>
            <div className="panel-sub">
              {managerMode ? (
                <>
                  Choose <strong>Add to request</strong>, enter quantity in the dialog, then review under{' '}
                  <strong>Request</strong>.
                </>
              ) : (
                <>Every catalogue SKU stocked at this outlet — on-hand vs par · request from HQ when needed.</>
              )}
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
                {managerMode ? (
                  <th className="r">Draft</th>
                ) : (
                  <th className="r">Replenishment</th>
                )}
              </tr>
            </thead>
            <tbody>
              {OUTLET_ROWS.map((r) => {
                const low = r.onHand <= r.minimum
                const pending = Boolean(requested[r.sku])
                const inDraft = draftSkus?.has(r.sku)
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
                    {managerMode ? (
                      <td className="r inv-draft-cell">
                        {inDraft ? (
                          <span className="inv-in-draft-chip" aria-label="Item is in draft request">
                            In Draft
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="inv-add-request-btn"
                            onClick={() => openQtyModal(r)}
                          >
                            <Plus width={14} strokeWidth={2.5} aria-hidden />
                            Add to request
                          </button>
                        )}
                      </td>
                    ) : (
                      <td className="r">
                        <button
                          type="button"
                          className="mini-btn-inv"
                          disabled={pending}
                          onClick={() => requestStaff(r.sku, r.name)}
                        >
                          {pending ? 'Requested' : 'Request from HQ'}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>

      {managerMode && qtyModalRow ? (
        <div
          className="booking-modal-overlay inv-qty-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inv-qty-modal-title"
        >
          <button
            type="button"
            className="booking-modal-overlay__backdrop"
            aria-label="Close"
            onClick={() => setQtyModalRow(null)}
          />
          <article className="booking-modal-sheet booking-modal-sheet--dialog inv-qty-modal-sheet">
            <header className="booking-modal-sheet__top booking-modal-sheet__head inv-qty-modal-head">
              <div>
                <h2 id="inv-qty-modal-title" className="booking-modal-sheet__title">
                  Quantity for request
                </h2>
                <p className="muted inv-qty-modal-product">
                  <strong>{qtyModalRow.name}</strong>
                  <span className="inv-qty-modal-sku">{qtyModalRow.sku}</span>
                </p>
              </div>
              <button
                type="button"
                className="booking-icon-toggle"
                aria-label="Close"
                onClick={() => setQtyModalRow(null)}
              >
                <X width={20} height={20} strokeWidth={2} />
              </button>
            </header>
            <div className="booking-modal-sheet__body inv-qty-modal-body">
              <label className="booking-field">
                Units to add to draft
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="inv-draft-qty"
                  value={modalQty}
                  onChange={(e) => setModalQty(Math.max(1, Number(e.target.value) || 1))}
                  autoFocus
                />
              </label>
            </div>
            <footer className="booking-modal-sheet__foot inv-qty-modal-foot">
              <button type="button" className="btn btn-ghost" onClick={() => setQtyModalRow(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary inv-qty-modal-confirm" onClick={confirmQtyModal}>
                Add to draft
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </>
  )
}
