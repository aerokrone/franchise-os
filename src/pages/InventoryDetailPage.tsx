import { ArrowLeft, ClipboardList, Layers3, Radio, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { getCatalogProduct } from '../data/catalog'
import { HQ_TABLE, OUTLET_ROWS } from '../data/inventory-mock'

type LogItem = { at: string; label: string; detail: string }

function seed(sku: string, salt: string) {
  let h = 0
  const str = sku + salt
  for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i) * (i + 1)) % 99991
  return h
}

function skuLogs(sku: string): LogItem[] {
  const base = seed(sku, 'sku')
  return [
    {
      at: `Apr ${24 + (base % 4)} · ${9 + (base % 3)}:${String(12 + (base % 40)).padStart(2, '0')}`,
      label: 'Barcode verify',
      detail: `Cycle count confirmed label ${sku} — bin B-${(base % 12) + 1}-${(base % 8) + 1}.`,
    },
    {
      at: `Apr ${20 + (base % 5)} · 16:${String(20 + (base % 30)).padStart(2, '0')}`,
      label: 'Price band',
      detail: 'Promotional MAP window applied · ERP synced.',
    },
    {
      at: `Apr ${15 + (base % 6)} · 11:08`,
      label: 'Master data',
      detail: 'Attribute refresh: warranty tier, HS code, country of origin.',
    },
  ]
}

function restockLogs(sku: string): LogItem[] {
  const base = seed(sku, 'restock')
  return [
    {
      at: `Apr ${27} · 06:${30 + (base % 20)}`,
      label: 'HQ dispatch',
      detail: `Wave W-${200 + (base % 80)} · ${18 + (base % 24)} cartons staged for store network.`,
    },
    {
      at: `Apr ${22} · 14:${10 + (base % 40)}`,
      label: 'Inbound ASN',
      detail: 'Vendor ASN accepted · variance 0 · QC sample pass.',
    },
    {
      at: `Apr ${10} · 09:${40 + (base % 15)}`,
      label: 'Last full restock',
      detail: 'Endcap reset + back-stock top-up from central DC.',
    },
  ]
}

function activityLogs(sku: string): LogItem[] {
  const base = seed(sku, 'act')
  return [
    {
      at: `Today · ${13}:${String(10 + (base % 45)).padStart(2, '0')}`,
      label: 'Floor sale',
      detail: '2 units sold · basket linked to Silver member · receipt #4419.',
    },
    {
      at: `Apr ${27} · 10:${20 + (base % 30)}`,
      label: 'Reservation',
      detail: 'Web order ORD-MV held 1 unit for pick-pack (pickup lane B).',
    },
    {
      at: `Apr ${26} · 18:${5 + (base % 50)}`,
      label: 'Adjustment',
      detail: '−1 shrink logged · manager approval AF-7721.',
    },
    {
      at: `Apr ${25} · 08:02`,
      label: 'Opening count',
      detail: 'Opening on-hand matched system ledger.',
    },
  ]
}

export function InventoryDetailPage() {
  const { sku: rawSku } = useParams()
  const sku = rawSku ? decodeURIComponent(rawSku) : ''
  const { role } = useSession()
  const [imgBroken, setImgBroken] = useState(false)
  const product = getCatalogProduct(sku)
  const hq = HQ_TABLE.find((r) => r.sku === sku)
  const outlet = OUTLET_ROWS.find((r) => r.sku === sku)

  if (!product || !hq || !outlet) {
    return (
      <div className="stack-page">
        <Link to="/inventory" className="inv-detail-back">
          <ArrowLeft size={18} strokeWidth={2} /> Back to inventory
        </Link>
        <p className="muted">SKU not found.</p>
      </div>
    )
  }

  const outletPerspective = role !== 'hq_admin'

  return (
    <div className="stack-page stack-page--inv-detail">
      <Link to="/inventory" className="inv-detail-back">
        <ArrowLeft size={18} strokeWidth={2} /> Back to inventory
      </Link>

      <div className="inv-detail-layout">
        <aside className="inv-detail-aside">
          <div className="inv-detail-figure">
            {imgBroken ? (
              <div
                className="inv-detail-figure-fallback"
                aria-hidden
              />
            ) : (
              <img
                src={product.image}
                alt=""
                loading="eager"
                decoding="async"
                onError={() => setImgBroken(true)}
              />
            )}
          </div>

          <h1 className="inv-detail-title">{product.name}</h1>

          <div className="inv-detail-meta">
            <span className="nav-tag">{sku}</span>
            <span className="muted">{product.cat}</span>
          </div>

          <section className="inv-detail-overview" aria-label="Product overview">
            <dl>
              <div className="inv-detail-overview-row">
                <dt>SKU</dt>
                <dd>{sku}</dd>
              </div>
              <div className="inv-detail-overview-row">
                <dt>Category</dt>
                <dd>{product.cat}</dd>
              </div>
              <div className="inv-detail-overview-row">
                <dt>Retail (mock)</dt>
                <dd>RM {product.price.toFixed(2)}</dd>
              </div>
              {outletPerspective ? (
                <>
                  <div className="inv-detail-overview-row">
                    <dt>Outlet on hand</dt>
                    <dd>{outlet.onHand}</dd>
                  </div>
                  <div className="inv-detail-overview-row">
                    <dt>Par level</dt>
                    <dd>{outlet.minimum}</dd>
                  </div>
                  <div className="inv-detail-overview-row">
                    <dt>Status</dt>
                    <dd>
                      {outlet.onHand <= outlet.minimum ? (
                        <span className="nav-tag inv-tag-alert">Below par</span>
                      ) : (
                        <span className="muted">Healthy</span>
                      )}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="inv-detail-overview-row">
                    <dt>HQ on hand</dt>
                    <dd>{hq.hq.toLocaleString()}</dd>
                  </div>
                  <div className="inv-detail-overview-row">
                    <dt>Allocated</dt>
                    <dd>{hq.allocated.toLocaleString()}</dd>
                  </div>
                  <div className="inv-detail-overview-row">
                    <dt>Staging outbound</dt>
                    <dd>{hq.outbound.toLocaleString()}</dd>
                  </div>
                  <div className="inv-detail-overview-row">
                    <dt>Next ship window</dt>
                    <dd>{hq.nextShip}</dd>
                  </div>
                </>
              )}
            </dl>
          </section>
        </aside>

        <div className="inv-detail-main">
          <article className="panel inv-detail-section">
            <div className="inv-detail-card-head">
              <Radio size={20} strokeWidth={2} />
              <h2>SKU audit trail</h2>
            </div>
            <ul className="inv-log-list">
              {skuLogs(sku).map((log) => (
                <li key={log.at + log.label}>
                  <time>{log.at}</time>
                  <span>
                    <strong>{log.label}</strong> — {log.detail}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel inv-detail-section">
            <div className="inv-detail-card-head">
              <Truck size={20} strokeWidth={2} />
              <h2>Last restock</h2>
            </div>
            <ul className="inv-log-list">
              {restockLogs(sku).map((log) => (
                <li key={log.at + log.label}>
                  <time>{log.at}</time>
                  <span>
                    <strong>{log.label}</strong> — {log.detail}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel inv-detail-section">
            <div className="inv-detail-card-head">
              <ClipboardList size={20} strokeWidth={2} />
              <h2>Activity · {outletPerspective ? 'this outlet' : 'network lens'}</h2>
            </div>
            <ul className="inv-log-list">
              {(outletPerspective ? activityLogs(sku) : networkActivity(sku)).map((log) => (
                <li key={log.at + log.label}>
                  <time>{log.at}</time>
                  <span>
                    <strong>{log.label}</strong> — {log.detail}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {!outletPerspective ? (
            <article className="panel inv-detail-section">
              <div className="inv-detail-card-head">
                <Layers3 size={20} strokeWidth={2} />
                <h2>Outlet stocking footprint (mock)</h2>
              </div>
              <p className="muted" style={{ marginBottom: 12 }}>
                SKUs are reflected at outlets with active sellable bins for this cycle.
              </p>
              <ul className="inv-log-list">
                {hq.stockedOutletIds.map((id) => (
                  <li key={id}>
                    <time>{id.toUpperCase()}</time>
                    <span>Stocked · sell-through within target band · last inter-store move 6d ago.</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function networkActivity(sku: string): LogItem[] {
  const base = seed(sku, 'net')
  return [
    ...activityLogs(sku).slice(0, 2),
    {
      at: `Apr ${24} · 07:${15 + (base % 20)}`,
      label: '1 Utama',
      detail: 'Transfer request MV → 1U · 6 units in motion.',
    },
    {
      at: `Apr ${23} · 19:40`,
      label: 'KL Sentral',
      detail: 'End-of-day snapshot · no variance on ' + sku + '.',
    },
  ]
}
