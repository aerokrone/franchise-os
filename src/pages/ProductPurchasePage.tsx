import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  Check,
  CreditCard,
  Crown,
  Grid3x3,
  MapPin,
  Minus,
  Phone,
  Plus,
  Smartphone,
  Store,
  Trash2,
  Truck,
  Wallet,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { getCatalogProducts, type CatalogProduct } from '../data/catalog'
import { DEMO_CUSTOMER_ID, placeOrder, type FulfillmentMode } from '../data/orders-store'

type Product = CatalogProduct

type CartLine = {
  sku: string
  name: string
  cat: string
  price: number
  qty: number
  image: string
}

function lookupProduct(sku: string, list: Product[]): Product | undefined {
  return list.find((p) => p.sku === sku)
}

function stockCapacityMax(p: Product) {
  return p.cat === 'Mobile' ? 60 : p.cat === 'Computing' ? 35 : p.cat === 'Accessories' ? 45 : 25
}

function stockPct(p: Product) {
  const max = stockCapacityMax(p)
  return `${Math.min(100, Math.round((p.stock / max) * 100))}%`
}

function stockHealthTier(p: Product): 'good' | 'warn' | 'low' {
  const max = stockCapacityMax(p)
  const pct = max <= 0 ? 0 : (p.stock / max) * 100
  if (pct >= 40) return 'good'
  if (pct >= 18) return 'warn'
  return 'low'
}

type PayMethod = 'Cash' | 'Card' | 'DuitNow' | 'GrabPay'

export function ProductPurchasePage() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { displayName, userInitials } = useSession()
  const products = useMemo(() => getCatalogProducts(), [])
  const [cat, setCat] = useState<string>('All')
  const query = useMemo(() => new URLSearchParams(search).get('q') ?? '', [search])
  const [fulfill, setFulfill] = useState<FulfillmentMode>('pickup')
  const [pay, setPay] = useState<PayMethod>('DuitNow')
  const [lines, setLines] = useState<CartLine[]>([])
  const [done, setDone] = useState<{ id: string } | null>(null)
  const [addr, setAddr] = useState('A-12-04, Damansara Heights, 50490 KL')
  const [imgBroken, setImgBroken] = useState<Record<string, true>>({})

  const markImgBroken = (sku: string) => {
    setImgBroken((prev) => (prev[sku] ? prev : { ...prev, [sku]: true }))
  }

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length }
    for (const p of products) {
      counts[p.cat] = (counts[p.cat] ?? 0) + 1
    }
    return counts
  }, [products])

  const lowCount = useMemo(() => products.filter((p) => p.lowStock || p.stock <= 6).length, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = cat === 'All' || p.cat === cat
      const okQ =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase())
      return okCat && okQ
    })
  }, [cat, products, query])

  const addLine = (p: Product) => {
    if (p.stock <= 0) return
    setLines((prev) => {
      const i = prev.findIndex((l) => l.sku === p.sku)
      if (i >= 0) {
        const next = [...prev]
        if (next[i].qty >= p.stock) return next
        next[i] = { ...next[i], qty: next[i].qty + 1 }
        return next
      }
      return [...prev, { sku: p.sku, name: p.name, cat: p.cat, price: p.price, qty: 1, image: p.image }]
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const disc = subtotal * 0.05 * 0.1
  const afterDisc = subtotal - disc
  const sst = afterDisc * 0.06
  const total = afterDisc + sst

  const payLine = `via ${pay}`

  const checkout = () => {
    if (!lines.length) return
    const o = placeOrder({
      customerId: DEMO_CUSTOMER_ID,
      customerName: displayName,
      customerPhone: '+60 12-345 6789',
      outletId: 'mv',
      outletName: 'Mid Valley',
      fulfillment: fulfill,
      lines: lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        qty: l.qty,
        unitPrice: l.price,
      })),
      subtotal,
      sst,
      total,
      shippingAddress: fulfill === 'online' ? addr : undefined,
      logisticsProvider: fulfill === 'online' ? null : null,
      notes: `Payment preference: ${pay}`,
    })
    setDone({ id: o.id })
    setLines([])
  }

  useEffect(() => {
    if (done) {
      const t = window.setTimeout(() => navigate('/my-orders'), 2400)
      return () => window.clearTimeout(t)
    }
  }, [done, navigate])

  if (done) {
    return (
      <div className="franchise-pos franchise-pos--embedded">
        <div className="shop-pos-success-shell">
          <article className="shop-pos-confirm reveal">
            <div className="shop-confirm-icon">
              <Check size={34} strokeWidth={2.5} />
            </div>
            <h2 className="shop-pos-confirm-title">Order placed</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              Thanks {displayName.split(' ')[0]}. We&apos;re routing this to the store team.
            </p>
            <dl className="shop-confirm-dl">
              <div>
                <dt>Order ID</dt>
                <dd>{done.id}</dd>
              </div>
              <div>
                <dt>Fulfilment</dt>
                <dd>{fulfill === 'online' ? 'Delivery' : 'Pick up in store'}</dd>
              </div>
            </dl>
            <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
              Redirecting to My orders…
            </p>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="franchise-pos franchise-pos--embedded">
      <div className="pos">
        <section className="catalog">
          <div className="catalog-head">
            <div className="catalog-titlerow reveal">
              <h1>Catalog</h1>
              <div className="meta">
                {products.length} SKUs · <b>{lowCount} low</b> · search in the top bar
              </div>
            </div>
            <div className="catalog-bar reveal d1">
              <div className="cat-tabs" role="tablist">
                {(['All', 'Computing', 'Mobile', 'Audio', 'Accessories'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={cat === c}
                    className={`cat-tab${cat === c ? ' on' : ''}`}
                    onClick={() => setCat(c)}
                  >
                    {c === 'All' ? <Grid3x3 width={12} height={12} strokeWidth={2} /> : null}
                    {c === 'All' ? ' All' : c}{' '}
                    <span className="count">{tabCounts[c === 'All' ? 'All' : c] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-wrap">
            <div className="grid">
              {filtered.map((p, idx) => {
                const heroFallback = Boolean(imgBroken[p.sku])
                return (
                  <button
                    key={p.sku}
                    type="button"
                    className={`card reveal d${Math.min(2 + Math.floor(idx / 4), 5)}`}
                    onClick={() => addLine(p)}
                    disabled={p.stock <= 0}
                  >
                    <div className={`card-hero${heroFallback ? ' card-hero--fallback' : ''}`}>
                      {!heroFallback ? (
                        <img
                          className="card-img"
                          src={p.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={640}
                          height={440}
                          onError={() => markImgBroken(p.sku)}
                        />
                      ) : (
                        <svg className="glyph" viewBox="0 0 220 110" preserveAspectRatio="xMidYMid slice" aria-hidden>
                          <circle cx="160" cy="58" r="28" fill="currentColor" opacity="0.35" />
                        </svg>
                      )}
                      <span className="sku-tag">{p.sku}</span>
                      {p.lowStock || p.stock <= 6 ? (
                        <span className="lowstock-tag">
                          <AlertTriangle size={10} strokeWidth={2} /> LOW
                        </span>
                      ) : null}
                    </div>
                    <div className="card-body">
                      <div className="card-name">{p.name}</div>
                      <div className="card-foot">
                        <div className="card-price">
                          <small>RM</small>
                          {p.price.toFixed(2)}
                        </div>
                        <div className={`card-stock stock-health--${stockHealthTier(p)}`}>
                          <span className="stock-bar">
                            <i style={{ width: stockPct(p) }} />
                          </span>
                          Stock {p.stock}
                        </div>
                      </div>
                    </div>
                    <span className="add-btn" aria-hidden>
                      <Plus width={18} height={18} strokeWidth={2.5} />
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="register">
          <div className="reg-head reveal d1">
            <div className="titles">
              <h2>Your order</h2>
              <span className="order-no">NEW</span>
            </div>
            <div className="actions">
              <button
                type="button"
                className="icon-btn warn"
                title="Clear bag"
                disabled={!lines.length}
                onClick={() => setLines([])}
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="cust reveal d2">
            <div className="cust-row">
              <div className="ava">{userInitials}</div>
              <div className="info">
                <div className="name">
                  {displayName}
                  <span className="tier">
                    <Crown size={10} strokeWidth={2} /> SILVER
                  </span>
                </div>
                <div className="points">
                  +60 12-345 6789 · <b>2,150</b> pts available
                </div>
              </div>
            </div>
            <div className="cust-search">
              <Phone size={12} strokeWidth={2} />
              <input defaultValue="+60 12-345 6789" aria-label="Contact phone" readOnly />
            </div>
          </div>

          <div className="pay reveal d3">
            <div className="pay-label">Fulfilment</div>
            <div className="pay-grid pay-grid--fulfill">
              <button
                type="button"
                className={`pay-btn${fulfill === 'online' ? ' on' : ''}`}
                onClick={() => setFulfill('online')}
              >
                <Truck size={18} strokeWidth={2} />
                Delivery
              </button>
              <button
                type="button"
                className={`pay-btn${fulfill === 'pickup' ? ' on' : ''}`}
                onClick={() => setFulfill('pickup')}
              >
                <Store size={18} strokeWidth={2} />
                Pickup
              </button>
            </div>
          </div>

          {fulfill === 'online' ? (
            <div className="reveal d3" style={{ padding: '0 var(--register-pad-x) 4px' }}>
              <div className="pay-label">Ship to</div>
              <div className="cust-search">
                <MapPin size={12} strokeWidth={2} />
                <input
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  aria-label="Shipping address"
                />
              </div>
            </div>
          ) : null}

          <div className="cart-list-wrap reveal d4">
            <ul className="cart-list">
              {lines.map((l) => {
                const p = lookupProduct(l.sku, products)
                const cap = p?.stock ?? l.qty
                return (
                  <li key={l.sku} className="cart-item">
                    <div
                      className={`cart-thumb${l.image && !imgBroken[l.sku] ? ' cart-thumb--photo' : ''}`}
                    >
                      {l.image && !imgBroken[l.sku] ? (
                        <img
                          src={l.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={76}
                          height={76}
                          onError={() => markImgBroken(l.sku)}
                        />
                      ) : null}
                    </div>
                    <div className="cart-info">
                      <div className="nm">{l.name}</div>
                      <div className="px">RM {l.price.toFixed(2)}</div>
                    </div>
                    <div className="qty">
                      <button
                        type="button"
                        aria-label="Decrease"
                        onClick={() =>
                          setLines((prev) =>
                            prev
                              .map((x) => (x.sku === l.sku ? { ...x, qty: x.qty - 1 } : x))
                              .filter((x) => x.qty > 0),
                          )
                        }
                      >
                        <Minus width={12} height={12} strokeWidth={2.5} />
                      </button>
                      <span className="n">{l.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase"
                        disabled={l.qty >= cap}
                        onClick={() =>
                          setLines((prev) =>
                            prev.map((x) => (x.sku === l.sku ? { ...x, qty: x.qty + 1 } : x)),
                          )
                        }
                      >
                        <Plus width={12} height={12} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="cart-line">{(l.price * l.qty).toFixed(2)}</div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="summary reveal d5">
            <div className="sum-row">
              <span>Subtotal · {lines.reduce((n, l) => n + l.qty, 0)} items</span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="sum-row disc">
              <span>Member discount · SILVER</span>
              <span>− RM {disc.toFixed(2)}</span>
            </div>
            <div className="sum-row">
              <span>SST 6%</span>
              <span>RM {sst.toFixed(2)}</span>
            </div>
            <div className="sum-row total">
              <span>Total</span>
              <b>RM {total.toFixed(2)}</b>
            </div>
          </div>

          <div className="pay reveal d6">
            <div className="pay-label">Payment Method</div>
            <div className="pay-grid">
              {(
                [
                  ['Cash', Banknote],
                  ['Card', CreditCard],
                  ['DuitNow', Smartphone],
                  ['GrabPay', Wallet],
                ] as const
              ).map(([label, Ico]) => (
                <button
                  key={label}
                  type="button"
                  className={`pay-btn${pay === label ? ' on' : ''}`}
                  onClick={() => setPay(label)}
                >
                  <Ico size={18} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="checkout reveal d7">
            <button type="button" className="checkout-btn" disabled={!lines.length} onClick={checkout}>
              <span className="ck-icon">
                <Check size={18} strokeWidth={2.5} />
              </span>
              <span className="ck-text">
                <span>Place order</span>
                <strong>{payLine}</strong>
              </span>
              <span className="ck-amt">RM {total.toFixed(2)}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
