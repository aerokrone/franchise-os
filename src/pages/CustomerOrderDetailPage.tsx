import { ArrowLeft, MapPin, Package, Store, Truck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  DEMO_CUSTOMER_ID,
  orderByIdForCustomer,
  subscribeOrders,
  type StoreOrder,
} from '../data/orders-store'
import { getCatalogProduct } from '../data/catalog'

function statusStep(order: StoreOrder): number {
  if (order.status === 'cancelled') return -1
  if (order.status === 'completed') return 3
  if (order.status === 'shipped' || order.status === 'ready_pickup') return 2
  if (order.status === 'confirmed' || order.status === 'packing') return 1
  return 0
}

function stepLabels(order: StoreOrder): string[] {
  if (order.fulfillment === 'online') {
    return ['Order placed', 'Preparing', 'Shipped', 'Delivered']
  }
  return ['Order placed', 'Preparing', 'Ready for pickup', 'Collected']
}

export function CustomerOrderDetailPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<StoreOrder | null>(() =>
    orderByIdForCustomer(orderId, DEMO_CUSTOMER_ID),
  )
  const [imgBroken, setImgBroken] = useState<Record<string, true>>({})

  useEffect(() => {
    const sync = () => {
      const o = orderByIdForCustomer(orderId, DEMO_CUSTOMER_ID)
      setOrder(o)
      if (!o) navigate('/my-orders', { replace: true })
    }
    sync()
    return subscribeOrders(sync)
  }, [orderId, navigate])

  const labels = useMemo(() => (order ? stepLabels(order) : []), [order])
  const step = order ? statusStep(order) : 0
  const cancelled = order?.status === 'cancelled'

  if (!order) {
    return null
  }

  const FulfillIcon = order.fulfillment === 'online' ? Truck : Package

  return (
    <div className="stack-page stack-page--customer order-detail-page">
      <Link to="/my-orders" className="order-detail-back">
        <ArrowLeft size={18} strokeWidth={2} aria-hidden />
        Back to my orders
      </Link>

      <header className="order-detail-hero reveal">
        <div className="order-detail-hero__top">
          <div>
            <p className="order-detail-eyebrow">Order detail</p>
            <h1 className="order-detail-id">{order.id}</h1>
            <p className="muted order-detail-sub">
              {new Date(order.createdAt).toLocaleString('en-MY', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              · {order.outletName}
            </p>
          </div>
          <span className="nav-tag order-detail-tag">
            <FulfillIcon size={12} strokeWidth={2} style={{ marginRight: 6 }} />
            {order.fulfillment === 'online' ? 'Delivery' : 'Store pickup'}
          </span>
        </div>

        {!cancelled ? (
          <div className="order-progress" aria-label="Order progress">
            {labels.map((label, i) => {
              const done = order.status === 'completed' ? true : i < step
              const current = order.status === 'completed' ? false : i === step
              return (
                <div key={label} className={`order-progress__step${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}>
                  <div className="order-progress__dot-wrap">
                    <span className="order-progress__dot">{i + 1}</span>
                    {i < labels.length - 1 ? <span className="order-progress__bar" /> : null}
                  </div>
                  <span className="order-progress__label">{label}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="order-detail-cancelled">This order was cancelled.</p>
        )}
      </header>

      <section className="order-detail-panel reveal">
        <h2 className="order-detail-panel__title">
          {order.fulfillment === 'online' ? (
            <>
              <Truck size={18} strokeWidth={2} /> Delivery address
            </>
          ) : (
            <>
              <Store size={18} strokeWidth={2} /> Pick-up location
            </>
          )}
        </h2>
        {order.fulfillment === 'online' ? (
          <div className="order-detail-address">
            <MapPin size={18} strokeWidth={2} className="order-detail-address__icon" />
            <div>
              <p>{order.shippingAddress ?? '—'}</p>
              {order.logisticsProvider ? (
                <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                  Carrier: <strong>{order.logisticsProvider}</strong>
                  {order.trackingRef ? (
                    <>
                      {' '}
                      · Tracking <span className="track-code">{order.trackingRef}</span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="order-detail-address">
            <Store size={18} strokeWidth={2} className="order-detail-address__icon" />
            <div>
              <p>
                <strong>{order.outletName}</strong> — Mid Valley Megastore, KL
              </p>
              <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Bring your order ID and a photo ID. Counter opens 10:00–22:00.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="order-detail-panel reveal">
        <h2 className="order-detail-panel__title">Items purchased</h2>
        <ul className="order-detail-lines">
          {order.lines.map((l) => {
            const cat = getCatalogProduct(l.sku)
            const img = cat?.image
            const broken = imgBroken[l.sku]
            return (
              <li key={l.sku} className="order-detail-line">
                <div className={`order-detail-thumb${img && !broken ? ' order-detail-thumb--photo' : ''}`}>
                  {img && !broken ? (
                    <img
                      src={img}
                      alt=""
                      width={112}
                      height={112}
                      loading="lazy"
                      onError={() => setImgBroken((p) => (p[l.sku] ? p : { ...p, [l.sku]: true }))}
                    />
                  ) : null}
                </div>
                <div className="order-detail-line__body">
                  <div className="order-detail-line__name">{l.name}</div>
                  <div className="order-detail-line__sku">{l.sku}</div>
                  <div className="order-detail-line__foot">
                    <span className="order-detail-line__px">RM {l.unitPrice.toFixed(2)} each</span>
                    <span className="order-detail-line__qty">× {l.qty}</span>
                  </div>
                </div>
                <div className="order-detail-line__sum">RM {(l.unitPrice * l.qty).toFixed(2)}</div>
              </li>
            )
          })}
        </ul>

        <div className="order-detail-summary">
          <div className="order-detail-summary__row">
            <span>Subtotal</span>
            <span>RM {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="order-detail-summary__row">
            <span>SST 6%</span>
            <span>RM {order.sst.toFixed(2)}</span>
          </div>
          <div className="order-detail-summary__row order-detail-summary__row--total">
            <span>Order total</span>
            <strong>RM {order.total.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {order.notes ? (
        <section className="order-detail-panel reveal">
          <strong style={{ color: 'var(--ink-2)' }}>Note:</strong>{' '}
          <span className="muted">{order.notes}</span>
        </section>
      ) : null}
    </div>
  )
}
