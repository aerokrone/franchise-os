import { useEffect, useMemo, useState } from 'react'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import {
  LOGISTICS_OPTIONS,
  loadOrders,
  subscribeOrders,
  updateOrder,
  type LogisticsProvider,
  type OrderStatus,
  type StoreOrder,
} from '../data/orders-store'

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'packing',
  'shipped',
  'ready_pickup',
  'completed',
]

export function OutletOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>(() => loadOrders())

  useEffect(() => {
    const refresh = () => setOrders(loadOrders())
    refresh()
    return subscribeOrders(refresh)
  }, [])
  const [filter, setFilter] = useState<'all' | 'online' | 'pickup'>('all')

  const rows = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => o.fulfillment === filter)
  }, [orders, filter])

  return (
    <div className="stack-page">
      <ModuleTitlerow
        lead="Store orders"
        meta={
          <>
            Fulfil web purchases · {rows.length} in view · assign couriers for online shipments
          </>
        }
      />

      <article className="panel">
        <div className="outlets-head outlets-head--range">
          <div>
            <div className="panel-title">Order queue</div>
            <div className="panel-sub">Mid Valley · operational view</div>
          </div>
          <div className="range-tabs" aria-label="Fulfillment filter">
            {(
              [
                ['all', 'All'],
                ['online', 'Online'],
                ['pickup', 'Pickup'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={filter === k ? 'on' : ''}
                onClick={() => setFilter(k)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="outlets">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Fulfilment</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Logistics</th>
                <th className="r">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

function OrderRow({ order: o }: { order: StoreOrder }) {
  const advance = () => {
    const i = STATUS_FLOW.indexOf(o.status)
    if (i < 0 || i >= STATUS_FLOW.length - 1) return
    updateOrder(o.id, { status: STATUS_FLOW[i + 1] })
  }

  const setStatus = (status: OrderStatus) => updateOrder(o.id, { status })

  const setProvider = (logisticsProvider: LogisticsProvider | '') => {
    updateOrder(o.id, {
      logisticsProvider: logisticsProvider || null,
      trackingRef:
        o.trackingRef ??
        (logisticsProvider ? `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : undefined),
    })
  }

  const setTrack = (trackingRef: string) => updateOrder(o.id, { trackingRef })

  return (
    <tr>
      <td className="lead">
        <div className="outlet-name">{o.id}</div>
        <div className="outlet-region">
          {new Date(o.createdAt).toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </td>
      <td>
        <div className="outlet-name">{o.customerName}</div>
        <div className="outlet-region">{o.customerPhone}</div>
      </td>
      <td>
        <span className="nav-tag">{o.fulfillment === 'online' ? 'Online' : 'Pickup'}</span>
      </td>
      <td>
        {o.lines.map((l) => (
          <div key={l.sku} style={{ fontSize: 13 }}>
            {l.qty}× {l.name}
          </div>
        ))}
      </td>
      <td className="r">RM {o.total.toFixed(2)}</td>
      <td>
        <select
          className="shop-select shop-select--table"
          value={o.status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          aria-label={`Status for ${o.id}`}
        >
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
          <option value="cancelled">cancelled</option>
        </select>
      </td>
      <td>
        {o.fulfillment === 'online' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
            <select
              className="shop-select shop-select--table"
              value={o.logisticsProvider ?? ''}
              onChange={(e) => setProvider((e.target.value as LogisticsProvider | '') || '')}
              aria-label={`Courier for ${o.id}`}
            >
              <option value="">Assign provider…</option>
              {LOGISTICS_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              className="outlet-order-track-input"
              value={o.trackingRef ?? ''}
              placeholder="Tracking ref"
              aria-label={`Tracking for ${o.id}`}
              onChange={(e) => setTrack(e.target.value)}
            />
          </div>
        ) : (
          <span className="muted">Counter pickup</span>
        )}
      </td>
      <td className="r">
        <div className="outlet-order-actions">
          <button type="button" className="mini-btn-inv" onClick={advance}>
            Next status
          </button>
        </div>
      </td>
    </tr>
  )
}
