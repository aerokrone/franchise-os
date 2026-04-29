import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  Check,
  CreditCard,
  Grid3x3,
  Lock,
  Pause,
  Phone,
  Plus,
  Minus,
  Search,
  Smartphone,
  Ticket,
  Trash2,
  Wallet,
  AlertTriangle,
  Crown,
  Bell,
} from 'lucide-react'
import content from '../data/content-details.json'
import { ThemeToggle } from '../components/ThemeToggle'
import { useSession } from '../context/SessionContext'

type Product = {
  sku: string
  name: string
  cat: string
  price: number
  stock: number
  lowStock?: boolean
  image: string
}

const posProductsEl = content.pages.pos.elements.find((e) => e.id === 'product-grid')!
const PRODUCTS = (posProductsEl as { content: { products: Product[] } }).content.products

type CartLine = {
  sku: string
  name: string
  cat: string
  price: number
  qty: number
  image: string
}

function lookupProduct(sku: string): Product | undefined {
  return PRODUCTS.find((p) => p.sku === sku)
}

function stockCapacityMax(p: Product) {
  return p.cat === 'Mobile' ? 60 : p.cat === 'Computing' ? 35 : p.cat === 'Accessories' ? 45 : 25
}

function stockPct(p: Product) {
  const max = stockCapacityMax(p)
  return `${Math.min(100, Math.round((p.stock / max) * 100))}%`
}

/** Stock bar fill: green / orange / red by level vs category capacity */
function stockHealthTier(p: Product): 'good' | 'warn' | 'low' {
  const max = stockCapacityMax(p)
  const pct = max <= 0 ? 0 : (p.stock / max) * 100
  if (pct >= 40) return 'good'
  if (pct >= 18) return 'warn'
  return 'low'
}

export function POSPage() {
  const { displayName, subtitle, userInitials } = useSession()
  const [cat, setCat] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [pay, setPay] = useState('DuitNow')
  const [clock, setClock] = useState('--:--:--')
  const [imgBroken, setImgBroken] = useState<Record<string, true>>({})

  const markImgBroken = (sku: string) => {
    setImgBroken((prev) => (prev[sku] ? prev : { ...prev, [sku]: true }))
  }

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: PRODUCTS.length }
    for (const p of PRODUCTS) {
      counts[p.cat] = (counts[p.cat] ?? 0) + 1
    }
    return counts
  }, [])

  const lowCount = useMemo(() => PRODUCTS.filter((p) => p.lowStock || p.stock <= 6).length, [])

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const okCat = cat === 'All' || p.cat === cat
      const okQ =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      return okCat && okQ
    })
  }, [cat, query])

  const [lines, setLines] = useState<CartLine[]>(() => {
    const seed: { sku: string; qty: number }[] = [
      { sku: 'CP-001', qty: 2 },
      { sku: 'MB-002', qty: 2 },
      { sku: 'AU-001', qty: 1 },
    ]
    return seed.flatMap(({ sku, qty }) => {
      const p = lookupProduct(sku)
      if (!p) return []
      return [{ sku: p.sku, name: p.name, cat: p.cat, price: p.price, qty, image: p.image }]
    })
  })

  const addLine = (p: Product) => {
    if (p.stock <= 0) return
    setLines((prev) => {
      const i = prev.findIndex((l) => l.sku === p.sku)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: next[i].qty + 1 }
        return next
      }
      return [
        ...prev,
        { sku: p.sku, name: p.name, cat: p.cat, price: p.price, qty: 1, image: p.image },
      ]
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const disc = subtotal * 0.05 * 0.1
  const afterDisc = subtotal - disc
  const sst = afterDisc * 0.06
  const total = afterDisc + sst

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const payLine = `via ${pay}`

  return (
    <div className="franchise-pos franchise-pos--embedded">
      <header className="pos-topbar pos-topbar--in-shell">
        <div className="topbar-mid">
          <span className="lane-pill">
            <span className="pulse" /> Open · accepting orders
          </span>
          <span className="crumb">
            POS · <b>Sales</b> · Order <b>#1547</b>
          </span>
        </div>

        <div className="topbar-right">
          <div className="pos-topbar-quick">
            <ThemeToggle className="bell pos-bell" />
            <button type="button" className="bell pos-bell" aria-label="Notifications">
              <Bell width={16} height={16} strokeWidth={2} />
              <span className="dot" />
            </button>
          </div>
          <div className="clock">
            {clock}
            <small>Tue · 28 Apr</small>
          </div>
          <button type="button" className="icon-btn warn" title="Hold sale">
            <Pause size={16} strokeWidth={2} />
          </button>
          <button type="button" className="icon-btn" title="Lock terminal">
            <Lock size={16} strokeWidth={2} />
          </button>
          <div className="cashier-chip">
            <div className="ava">{userInitials}</div>
            <div className="who">
              <b>{displayName}</b>
              <span>{subtitle}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pos">
        <section className="catalog">
          <div className="catalog-head">
            <div className="catalog-titlerow reveal">
              <h1>Catalog</h1>
              <div className="meta">
                {PRODUCTS.length} SKUs · <b>{lowCount} low</b> · ⌘F to search
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
              <label className="cat-search">
                <Search width={14} height={14} strokeWidth={2} />
                <input
                  placeholder="Search SKU or name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
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
                    {p.lowStock ? (
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
              <h2>Current Sale</h2>
              <span className="order-no">1547</span>
            </div>
            <div className="actions">
              <button type="button" className="icon-btn" title="Add note">
                <Ticket size={16} strokeWidth={2} />
              </button>
              <button type="button" className="icon-btn warn" title="Void cart">
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="cust reveal d2">
            <div className="cust-row">
              <div className="ava">SL</div>
              <div className="info">
                <div className="name">
                  Sarah Lim
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
              <input defaultValue="+60 12-345 6789" aria-label="Customer phone" />
            </div>
          </div>

          <div className="cart-list-wrap reveal d3">
            <ul className="cart-list">
              {lines.map((l) => (
                <li key={l.sku} className="cart-item">
                  <div
                    className={`cart-thumb${
                      l.image && !imgBroken[l.sku] ? ' cart-thumb--photo' : ''
                    }`}
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
              ))}
            </ul>
          </div>

          <div className="summary reveal d4">
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

          <div className="pay reveal d5">
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

          <div className="checkout reveal d6">
            <button type="button" className="checkout-btn">
              <span className="ck-icon">
                <Check size={18} strokeWidth={2.5} />
              </span>
              <span className="ck-text">
                <span>Complete Sale</span>
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
