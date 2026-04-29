import { MapPin, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  MOCK_CUSTOMER_LAT,
  MOCK_CUSTOMER_LNG,
  TIME_SLOTS,
  distanceKm,
  formatDateISO,
  nearestOutlet,
  type FranchiseService,
  type Outlet,
} from '../data/booking-mock'

export type BookingServiceModalProps = {
  open: boolean
  onClose: () => void
  service: FranchiseService | null
  outlets: Outlet[]
  /** Outlet → service enabled */
  outletOffersService: (outletId: string) => boolean
  bookings: { outletId: string; dateISO: string; time: string }[]
  mode: 'customer' | 'staff'
  suggestedOutletId?: string
  onConfirm: (p: { outletId: string; dateISO: string; time: string }) => void
}

export function BookingServiceModal({
  open,
  onClose,
  service,
  outlets,
  outletOffersService,
  bookings,
  mode,
  suggestedOutletId,
  onConfirm,
}: BookingServiceModalProps) {
  const [outletId, setOutletId] = useState<string>(() => outlets[0]?.id ?? '')
  const [dateISO, setDateISO] = useState(() => formatDateISO(new Date()))
  const [time, setTime] = useState(TIME_SLOTS[4] ?? '11:30')

  const nearest =
    mode === 'customer'
      ? nearestOutlet(MOCK_CUSTOMER_LAT, MOCK_CUSTOMER_LNG, outlets).outlet
      : outlets.find((o) => o.id === suggestedOutletId) ?? outlets[0]

  useEffect(() => {
    if (!open || !service) return
    if (mode === 'staff') {
      const sug =
        suggestedOutletId && outlets.some((o) => o.id === suggestedOutletId)
          ? suggestedOutletId
          : null
      const chosen =
        sug && outletOffersService(sug)
          ? sug
          : outlets.find((o) => outletOffersService(o.id))?.id ?? ''
      if (chosen) setOutletId(chosen)
      return
    }
    if (nearest) setOutletId((cur) => (outlets.some((o) => o.id === cur) ? cur : nearest.id))
  }, [open, service, outlets, nearest, mode, suggestedOutletId, outletOffersService])

  useEffect(() => {
    if (!open) return
    setDateISO(formatDateISO(new Date()))
  }, [open, service?.id])

  const { minDateISO, maxDateISO } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const max = new Date(today)
    max.setDate(max.getDate() + 365)
    return { minDateISO: formatDateISO(today), maxDateISO: formatDateISO(max) }
  }, [])

  const slotTaken = useMemo(() => {
    const set = new Set<string>()
    for (const b of bookings) {
      set.add(`${b.outletId}|${b.dateISO}|${b.time}`)
    }
    return set
  }, [bookings])

  const timeOptions = TIME_SLOTS.filter((t) => {
    const key = `${outletId}|${dateISO}|${t}`
    return !slotTaken.has(key)
  })

  useEffect(() => {
    if (timeOptions.includes(time)) return
    setTime(timeOptions[0] ?? TIME_SLOTS[0])
  }, [time, outletId, dateISO, timeOptions])

  if (!open || !service) return null

  return (
    <div className="booking-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <button type="button" className="booking-modal-overlay__backdrop" aria-label="Close" onClick={onClose} />
      <article className="booking-modal-sheet booking-modal-sheet--dialog">
        <header className="booking-modal-sheet__top booking-modal-sheet__head">
          <div>
            <p className="booking-sku">
              <span>{service.sku}</span>
            </p>
            <h2 id="booking-modal-title" className="booking-modal-sheet__title">
              {service.name}
            </h2>
            <p className="booking-svc-desc" style={{ marginTop: 8 }}>
              {service.description}
            </p>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span className="booking-pill">{service.category}</span>
              <span className="booking-pill">{service.durationMin} min</span>
              <span className="booking-pill booking-pill--accent">
                RM {service.price.toFixed(2)}
              </span>
            </div>
          </div>
          <button type="button" className="booking-icon-toggle" aria-label="Close" onClick={onClose}>
            <X width={20} height={20} strokeWidth={2} />
          </button>
        </header>

        <div className="booking-modal-sheet__body">
          {mode === 'customer' ? (
            <section className="booking-modal-section">
              <h3 className="booking-panel__title">
                <MapPin width={16} strokeWidth={2} aria-hidden /> Outlet selection
              </h3>
              <div className="booking-outlets">
                {[...outlets]
                  .sort((a, b) => {
                    const da = distanceKm({ lat: MOCK_CUSTOMER_LAT, lng: MOCK_CUSTOMER_LNG }, a)
                    const db = distanceKm({ lat: MOCK_CUSTOMER_LAT, lng: MOCK_CUSTOMER_LNG }, b)
                    return da - db
                  })
                  .map((o) => {
                  const offers = outletOffersService(o.id)
                  const isNear = nearest?.id === o.id
                  const km = distanceKm({ lat: MOCK_CUSTOMER_LAT, lng: MOCK_CUSTOMER_LNG }, o).toFixed(1)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={!offers}
                      className={`booking-out-card${outletId === o.id ? ' booking-out-card--on' : ''}${!offers ? ' booking-svc-card--muted' : ''}`}
                      onClick={() => setOutletId(o.id)}
                    >
                      <div className="booking-out-card__name">{o.name}</div>
                      <div className="booking-out-card__addr">{o.address}</div>
                      <div className="booking-out-meta">
                        <span className="booking-muted">{km} km</span>
                        {isNear && offers ? (
                          <span className="booking-nearest-badge">Nearest · easier access</span>
                        ) : null}
                        {!offers ? (
                          <span className="booking-muted booking-shrink">Unavailable here</span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          <div className="booking-field booking-field--date booking-modal-date">
            <label htmlFor="booking-service-date">
              Date
            </label>
            <input
              id="booking-service-date"
              type="date"
              className="booking-date-input"
              min={minDateISO}
              max={maxDateISO}
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value || minDateISO)}
              required
            />
          </div>

          <fieldset className="booking-slots-field">
            <legend>Time</legend>
            <div className="booking-slots">
              {TIME_SLOTS.map((slot) => {
                const blocked = slotTaken.has(`${outletId}|${dateISO}|${slot}`)
                const on = time === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={blocked}
                    title={blocked ? 'Slot taken' : undefined}
                    className={`booking-slot-btn${on ? ' booking-slot-btn--on' : ''}${blocked ? ' booking-svc-card--muted' : ''}`}
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        <footer className="booking-modal-sheet__foot">
          <button
            type="button"
            className="btn btn-primary booking-block-btn"
            disabled={
              !outletId ||
              !outletOffersService(outletId) ||
              TIME_SLOTS.every((slot) => slotTaken.has(`${outletId}|${dateISO}|${slot}`))
            }
            onClick={() => {
              onConfirm({ outletId, dateISO, time })
              onClose()
            }}
          >
            {mode === 'customer' ? 'Confirm booking' : 'Add booking line'}
          </button>
        </footer>
      </article>
    </div>
  )
}
