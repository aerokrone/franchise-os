import { ChevronRight, Clock, Package, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomerShell } from '../context/CustomerShellContext'
import { getCatalogProduct } from '../data/catalog'
import {
  DEMO_CUSTOMER_ID,
  ordersForCustomer,
  subscribeOrders,
  type OrderStatus,
  type StoreOrder,
} from '../data/orders-store'

type OrderTab = 'preparing' | 'ready_pickup' | 'shipped' | 'completed'

function orderTab(o: StoreOrder): OrderTab {
  if (o.status === 'completed') return 'completed'
  if (o.status === 'shipped') return 'shipped'
  if (o.status === 'ready_pickup') return 'ready_pickup'
  return 'preparing'
}

const TAB_LABEL: Record<OrderTab, string> = {
  preparing: 'Preparing',
  ready_pickup: 'Ready pickup',
  shipped: 'Shipped',
  completed: 'Completed',
}

function linesSummary(lines: StoreOrder['lines']): string {
  if (!lines.length) return ''
  const [first, ...rest] = lines
  const head =
    lines.length === 1 && first!.qty > 1 ? `${first!.name} ×${first!.qty}` : first!.name
  if (!rest.length) return head
  return `${head} · +${rest.length} more`
}

function orderCardHint(o: StoreOrder): string {
  const placed = new Date(o.createdAt)
  const fmtShort = (d: Date) =>
    d.toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' })

  switch (o.status) {
    case 'completed':
      return o.fulfillment === 'online'
        ? `Delivered · ${fmtShort(placed)}`
        : `Collected · ${fmtShort(placed)}`
    case 'shipped': {
      const est = new Date(placed)
      est.setDate(est.getDate() + 2)
      return `In transit · Est. ${fmtShort(est)}`
    }
    case 'ready_pickup':
      return `${o.outletName} · L3 counter · 10:00–22:00`
    case 'packing':
    case 'confirmed':
      return o.fulfillment === 'online' ? 'Preparing · Hand-off to courier soon' : 'Packing at store'
    case 'pending':
      return 'Queued · Starting shortly'
    case 'cancelled':
      return 'Cancelled'
    default:
      return ''
  }
}

function statusTagLabel(status: OrderStatus): string {
  if (status === 'ready_pickup') return 'Ready pickup'
  return status.replace(/_/g, ' ')
}

export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>(() => ordersForCustomer(DEMO_CUSTOMER_ID))
  const [tab, setTab] = useState<OrderTab>('preparing')
  const [imgBroken, setImgBroken] = useState<Record<string, true>>({})
  const { topSearch } = useCustomerShell()

  useEffect(() => {
    const refresh = () => setOrders(ordersForCustomer(DEMO_CUSTOMER_ID))
    refresh()
    return subscribeOrders(refresh)
  }, [])

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  )

  const filtered = useMemo(() => {
    const q = topSearch.trim().toLowerCase()
    return sortedOrders.filter((o) => {
      if (orderTab(o) !== tab) return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.outletName.toLowerCase().includes(q) ||
        o.lines.some((l) => l.name.toLowerCase().includes(q) || l.sku.toLowerCase().includes(q))
      )
    })
  }, [sortedOrders, tab, topSearch])

  const counts = useMemo(() => {
    const c: Record<OrderTab, number> = {
      preparing: 0,
      ready_pickup: 0,
      shipped: 0,
      completed: 0,
    }
    for (const o of sortedOrders) {
      c[orderTab(o)] += 1
    }
    return c
  }, [sortedOrders])

  const activeCount = useMemo(
    () => sortedOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length,
    [sortedOrders],
  )

  const hasSearch = topSearch.trim().length > 0

  return (
    <div className="stack-page stack-page--customer">
      <div className="module-titlerow reveal customer-orders-head">
        <h1>My orders</h1>
        <div className="customer-order-tabs" role="tablist" aria-label="Order status">
          {(Object.keys(TAB_LABEL) as OrderTab[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`customer-order-tab${tab === k ? ' is-active' : ''}`}
              onClick={() => setTab(k)}
            >
              {TAB_LABEL[k]}
              <span className="customer-order-tab__count">{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customer-orders-meta reveal">
        <p className="muted customer-orders-lead">
          Track deliveries and in-store pickups across outlets. Search matches order ID, outlet, or
          product name.
        </p>
        <p className="customer-orders-stats">
          <strong>{activeCount}</strong> <span className="muted">active</span>
          <span className="customer-orders-stats__sep" aria-hidden />
          <span className="muted">{sortedOrders.length} orders total</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="muted reveal">
          No orders in this tab{hasSearch ? ' matching your search' : ''}.
        </p>
      ) : (
        <ul className="customer-order-grid">
          {filtered.map((o) => {
            const thumbs = o.lines.slice(0, 3)
            const hint = orderCardHint(o)
            const shipHint =
              o.status === 'shipped' && o.trackingRef ? (
                <span className="customer-order-card__track mono">{o.trackingRef}</span>
              ) : null
            return (
              <li key={o.id}>
                <Link to={`/my-orders/${encodeURIComponent(o.id)}`} className="customer-order-card-link">
                  <article className="panel customer-order-card customer-order-card--tile reveal">
                    <div className="customer-order-card-head">
                      <div>
                        <h2 className="customer-order-card__id">{o.id}</h2>
                        <p className="muted customer-order-card__date">
                          {new Date(o.createdAt).toLocaleString('en-MY', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          · {o.outletName}
                        </p>
                      </div>
                      <span className="nav-tag">{statusTagLabel(o.status)}</span>
                    </div>

                    <div className="customer-order-card__preview">
                      <div className="customer-order-card__thumbs" aria-hidden>
                        {thumbs.map((ln) => {
                          const cat = getCatalogProduct(ln.sku)
                          const src = cat?.image
                          const broken = imgBroken[ln.sku]
                          return (
                            <div key={ln.sku + ln.name} className="customer-order-thumb">
                              {src && !broken ? (
                                <img
                                  src={src}
                                  alt=""
                                  width={40}
                                  height={40}
                                  loading="lazy"
                                  onError={() =>
                                    setImgBroken((p) => (p[ln.sku] ? p : { ...p, [ln.sku]: true }))
                                  }
                                />
                              ) : (
                                <Package size={18} strokeWidth={2} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p className="customer-order-card__lines">{linesSummary(o.lines)}</p>
                    </div>

                    <div className="customer-order-card__hint-row">
                      <span className="customer-order-card__hint">
                        <Clock size={13} strokeWidth={2} aria-hidden />
                        {hint}
                        {shipHint ? (
                          <>
                            {' '}
                            · {shipHint}
                          </>
                        ) : null}
                      </span>
                    </div>

                    <div className="customer-order-meta">
                      {o.fulfillment === 'online' ? (
                        <span className="nav-tag customer-order-chip">
                          <Truck size={12} strokeWidth={2} /> Delivery
                        </span>
                      ) : (
                        <span className="nav-tag customer-order-chip">
                          <Package size={12} strokeWidth={2} /> Pickup
                        </span>
                      )}
                      <div className="customer-order-meta__total-wrap">
                        <span className="muted customer-order-card__total">RM {o.total.toFixed(2)}</span>
                        <span className="customer-order-card__chevron" aria-hidden>
                          <ChevronRight size={18} strokeWidth={2} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
