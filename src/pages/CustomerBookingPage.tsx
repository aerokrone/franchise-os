import {
  Banknote,
  CalendarClock,
  Check,
  CreditCard,
  Crown,
  Grid3x3,
  MapPin,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { BookingServiceModal } from '../components/BookingServiceModal'
import { useBookingData } from '../context/BookingDataContext'
import { useSession } from '../context/SessionContext'
import {
  MOCK_CUSTOMER_LAT,
  MOCK_CUSTOMER_LNG,
  distanceKm,
  type FranchiseService,
} from '../data/booking-mock'

type BookingCartLine = {
  id: string
  service: FranchiseService
  outletId: string
  outletName: string
  dateISO: string
  time: string
}

function fmtDateShort(iso: string) {
  try {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return iso
  }
}

export function CustomerBookingPage() {
  const { displayName, subtitle, userInitials } = useSession()
  const { outlets, services, outletServices, bookings, addBooking } = useBookingData()

  const [cat, setCat] = useState<string>('All')
  const [modalSvc, setModalSvc] = useState<FranchiseService | null>(null)
  const [bookingCart, setBookingCart] = useState<BookingCartLine[]>([])
  const [pay, setPay] = useState('DuitNow')
  const [toast, setToast] = useState<string | null>(null)
  const [imgBroken, setImgBroken] = useState<Record<string, true>>({})
  const [sessionRef] = useState(() => String(Math.floor(2300 + Math.random() * 700)))

  const categories = ['All', 'Repair', 'Setup', 'Trade-in', 'Protection', 'Diagnostics'] as const

  const filtered = useMemo(
    () => services.filter((s) => s.active && (cat === 'All' || s.category === cat)),
    [services, cat],
  )

  const catCounts = useMemo(() => {
    const active = services.filter((s) => s.active)
    const counts: Record<string, number> = { All: active.length }
    for (const s of active) counts[s.category] = (counts[s.category] ?? 0) + 1
    return counts
  }, [services])

  const nearestStop = useMemo(
    () =>
      outlets
        .map((o) => ({
          o,
          km: distanceKm(
            { lat: MOCK_CUSTOMER_LAT, lng: MOCK_CUSTOMER_LNG },
            { lat: o.lat, lng: o.lng },
          ),
        }))
        .sort((a, b) => a.km - b.km)[0],
    [outlets],
  )

  const offerAt = (svcId: string, outletId: string) =>
    outletServices[outletId]?.[svcId] !== false

  const addToCart = (line: BookingCartLine) => setBookingCart((prev) => [...prev, line])

  const removeFromCart = (id: string) =>
    setBookingCart((prev) => prev.filter((l) => l.id !== id))

  const subtotal = bookingCart.reduce((s, l) => s + l.service.price, 0)
  const sst = subtotal * 0.06
  const total = subtotal + sst

  const tierLabel = subtitle.split(' · ')[0] ?? 'Member'
  const hasItems = bookingCart.length > 0

  const confirmAllBookings = () => {
    if (!hasItems) return
    const count = bookingCart.length
    for (const line of bookingCart) {
      addBooking({
        serviceId: line.service.id,
        outletId: line.outletId,
        dateISO: line.dateISO,
        time: line.time,
        customerName: displayName,
        customerPhone: '+60 12-345 6789',
        source: 'customer_app',
        status: 'confirmed',
      })
    }
    setBookingCart([])
    setToast(`${count} booking${count > 1 ? 's' : ''} confirmed · You're all set!`)
    window.setTimeout(() => setToast(null), 5000)
  }

  return (
    <div className="franchise-pos franchise-pos--embedded">
      <div className="pos">

        {/* ═══ LEFT: service catalogue ═══════════════════════════ */}
        <section className="catalog booking-customer-scope">
          <div className="catalog-head">
            <div className="catalog-titlerow reveal">
              <h1>Book a service</h1>
              <div className="meta">
                {filtered.length} services · <b>In-store appointments</b>
                {nearestStop ? (
                  <> · Nearest:&nbsp;<b>{nearestStop.o.name}</b> (~{nearestStop.km.toFixed(1)} km)</>
                ) : null}
              </div>
            </div>

            <div className="catalog-bar reveal d1 booking-nearest-banner">
              <span className="booking-nearest-chip">
                <MapPin width={14} height={14} strokeWidth={2} aria-hidden />
                Suggested for faster access:&nbsp;
                <strong>{nearestStop?.o.name ?? '—'}</strong>
              </span>
            </div>

            <div className="catalog-bar reveal d1">
              <div className="cat-tabs" role="tablist">
                {categories.map((c) => (
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
                    <span className="count">{catCounts[c === 'All' ? 'All' : c] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-wrap">
            <div className="grid">
              {filtered.map((svc, idx) => (
                <button
                  key={svc.id}
                  type="button"
                  className={`card reveal d${Math.min(2 + Math.floor(idx / 4), 5)} booking-card-pos-service`}
                  onClick={() => setModalSvc(svc)}
                >
                  <div className="card-hero booking-card-hero-service">
                    <img
                      className="card-img"
                      src={svc.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={640}
                      height={440}
                      onError={() => setImgBroken((p) => ({ ...p, [svc.id]: true }))}
                    />
                    <span className="sku-tag">{svc.sku}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-name">{svc.name}</div>
                    <div className="card-foot">
                      <div className="card-price">
                        <small>RM</small>
                        {svc.price.toFixed(2)}
                      </div>
                      <div className="card-stock stock-health--good">
                        <span>{svc.durationMin} min</span>
                      </div>
                    </div>
                  </div>
                  <span className="add-btn" aria-hidden>
                    <CalendarClock width={18} height={18} strokeWidth={2} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ RIGHT: booking register ═══════════════════════════ */}
        <aside className="register">

          {/* Header */}
          <div className="reg-head reveal d1">
            <div className="titles">
              <h2>My Booking</h2>
              <span className="order-no">{sessionRef}</span>
            </div>
            {hasItems ? (
              <div className="actions">
                <button
                  type="button"
                  className="icon-btn warn"
                  title="Clear all bookings"
                  onClick={() => setBookingCart([])}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              </div>
            ) : null}
          </div>

          {/* Customer card */}
          <div className="cust reveal d2">
            <div className="cust-row">
              <div className="ava">{userInitials}</div>
              <div className="info">
                <div className="name">
                  {displayName}
                  <span className="tier">
                    <Crown size={10} strokeWidth={2} />
                    {tierLabel.toUpperCase()}
                  </span>
                </div>
                <div className="points">
                  +60 12-345 6789 · <b>2,150</b> pts available
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="cart-list-wrap reveal d3">
            {!hasItems ? (
              <div className="bk-register-empty">
                <CalendarClock size={30} strokeWidth={1.4} />
                <p>Tap a service card to pick a date, time &amp; outlet.</p>
              </div>
            ) : (
              <ul className="cart-list">
                {bookingCart.map((line) => (
                  <li key={line.id} className="cart-item cart-item--service">
                    <div
                      className={`cart-thumb${!imgBroken[line.service.id] ? ' cart-thumb--photo' : ''}`}
                    >
                      {!imgBroken[line.service.id] ? (
                        <img
                          src={line.service.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={76}
                          height={76}
                          onError={() =>
                            setImgBroken((p) => ({ ...p, [line.service.id]: true }))
                          }
                        />
                      ) : null}
                    </div>
                    <div className="cart-info">
                      <div className="nm">{line.service.name}</div>
                      <div className="cart-svc-meta muted">
                        {line.outletName} · {fmtDateShort(line.dateISO)} · {line.time}
                      </div>
                      <div className="px">RM {line.service.price.toFixed(2)}</div>
                    </div>
                    <div className="qty">
                      <button
                        type="button"
                        className="bk-cart-remove"
                        aria-label={`Remove ${line.service.name}`}
                        onClick={() => removeFromCart(line.id)}
                      >
                        <Trash2 width={13} height={13} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="cart-line">{line.service.price.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Summary */}
          <div className="summary reveal d4">
            <div className="sum-row">
              <span>
                {hasItems
                  ? `Subtotal · ${bookingCart.length} service${bookingCart.length > 1 ? 's' : ''}`
                  : 'No services added yet'}
              </span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            {subtotal > 0 && (
              <div className="sum-row">
                <span>SST 6%</span>
                <span>RM {sst.toFixed(2)}</span>
              </div>
            )}
            <div className="sum-row total">
              <span>Total</span>
              <b>RM {total.toFixed(2)}</b>
            </div>
          </div>

          {/* Payment method */}
          <div className="pay reveal d5">
            <div className="pay-label">Payment Method</div>
            <div className="pay-grid pay-grid--fulfill">
              {(
                [
                  ['DuitNow', Smartphone],
                  ['Card', CreditCard],
                  ['Cash', Banknote],
                  ['eWallet', Wallet],
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

          {/* Confirm */}
          <div className="checkout reveal d6">
            <button
              type="button"
              className="checkout-btn"
              disabled={!hasItems}
              onClick={confirmAllBookings}
            >
              <span className="ck-icon">
                <Check size={18} strokeWidth={2.5} />
              </span>
              <span className="ck-text">
                <span>Confirm Booking</span>
                <strong>via {pay}</strong>
              </span>
              <span className="ck-amt">RM {total.toFixed(2)}</span>
            </button>
          </div>
        </aside>
      </div>

      {toast ? <p className="booking-toast booking-toast--confirm">{toast}</p> : null}

      <BookingServiceModal
        open={modalSvc != null}
        onClose={() => setModalSvc(null)}
        service={modalSvc}
        outlets={outlets}
        outletOffersService={(oid) => (modalSvc ? offerAt(modalSvc.id, oid) : false)}
        bookings={bookings.map((b) => ({
          outletId: b.outletId,
          dateISO: b.dateISO,
          time: b.time,
        }))}
        suggestedOutletId={nearestStop?.o.id}
        mode="customer"
        onConfirm={({ outletId, dateISO, time: t }) => {
          if (!modalSvc) return
          const outlet = outlets.find((o) => o.id === outletId)
          addToCart({
            id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            service: modalSvc,
            outletId,
            outletName: outlet?.name ?? outletId,
            dateISO,
            time: t,
          })
        }}
      />
    </div>
  )
}
