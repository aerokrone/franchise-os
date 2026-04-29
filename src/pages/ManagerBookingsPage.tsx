import {
  ArrowLeftRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Settings2,
  Shield,
  User,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import { useBookingData } from '../context/BookingDataContext'
import { useSession } from '../context/SessionContext'
import { formatDateISO, weekStartsFrom } from '../data/booking-mock'
import type { FranchiseService, ScheduledBooking } from '../data/booking-mock'

const CATEGORY_ICONS: Record<string, typeof CalendarClock> = {
  Repair: Wrench,
  Setup: Settings2,
  'Trade-in': ArrowLeftRight,
  Protection: Shield,
  Diagnostics: Cpu,
}

function fmtDayLabel(day: Date, todayISO: string): { label: string; sub: string } {
  const iso = formatDateISO(day)
  const weekday = day.toLocaleDateString('en-MY', { weekday: 'long' })
  const date = day.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  if (iso === todayISO) return { label: 'Today', sub: `${weekday}, ${date}` }
  const tmr = new Date()
  tmr.setDate(tmr.getDate() + 1)
  if (iso === formatDateISO(tmr)) return { label: 'Tomorrow', sub: `${weekday}, ${date}` }
  return { label: weekday, sub: date }
}

function BookingRow({ b, svc }: { b: ScheduledBooking; svc?: FranchiseService }) {
  const CatIcon = svc ? (CATEGORY_ICONS[svc.category] ?? CalendarClock) : CalendarClock
  const priceLabel = svc && svc.price > 0 ? `RM ${svc.price.toFixed(2)}` : 'Free'
  const isWalkin = b.source === 'pos'

  return (
    <article className={`mbk-row mbk-row--${b.status}`}>
      <div className="mbk-row__time">
        <span className="mbk-row__clock">{b.time}</span>
        <span className={`mbk-row__pip mbk-row__pip--${b.status}`} aria-hidden />
      </div>
      <div className="mbk-row__icon" aria-hidden>
        <CatIcon size={16} strokeWidth={1.8} />
      </div>
      <div className="mbk-row__body">
        <p className="mbk-row__svc">{svc?.name ?? b.serviceId}</p>
        <p className="mbk-row__cust">
          <User size={11} strokeWidth={2} aria-hidden />
          {b.customerName}
          {b.customerPhone ? (
            <span className="mbk-row__phone"> · {b.customerPhone}</span>
          ) : null}
        </p>
      </div>
      <div className="mbk-row__trail">
        <span className="mbk-row__dur">
          <Clock size={11} strokeWidth={2} aria-hidden />
          {svc?.durationMin ?? '—'} min
        </span>
        <span className={`mbk-row__source${isWalkin ? ' mbk-row__source--walkin' : ''}`}>
          {isWalkin ? 'Walk-in' : 'App'}
        </span>
        <span className="mbk-row__price muted">{priceLabel}</span>
      </div>
    </article>
  )
}

export function ManagerBookingsPage() {
  const { managedOutlet, role } = useSession()
  const { outlets, services, outletServices, setOutletService, bookings } = useBookingData()

  const outletId = managedOutlet?.id ?? 'mv'
  const outletName =
    outlets.find((o) => o.id === outletId)?.name ?? managedOutlet?.name ?? 'Your outlet'

  const [weekStart, setWeekStart] = useState(() => weekStartsFrom(new Date()))
  const [configure, setConfigure] = useState(false)

  const weekDays = useMemo(() => {
    const list: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime())
      d.setDate(weekStart.getDate() + i)
      list.push(d)
    }
    return list
  }, [weekStart])

  const weekLabel = `${weekDays[0].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${weekDays[6].toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`

  const svcById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])
  const todayISO = formatDateISO(new Date())

  const bookingsInView = useMemo(
    () =>
      bookings.filter((b) => {
        const inWeek = weekDays.some((x) => formatDateISO(x) === b.dateISO)
        return inWeek && b.outletId === outletId && b.status !== 'cancelled'
      }),
    [bookings, weekDays, outletId],
  )

  const groupedDays = useMemo(
    () =>
      weekDays
        .map((day) => {
          const iso = formatDateISO(day)
          const dayBks = bookingsInView
            .filter((b) => b.dateISO === iso)
            .sort((a, b) => a.time.localeCompare(b.time))
          return { iso, day, bookings: dayBks }
        })
        .filter((g) => g.bookings.length > 0),
    [weekDays, bookingsInView],
  )

  const shiftWeek = (dir: number) =>
    setWeekStart((ws) => {
      const next = new Date(ws.getTime())
      next.setDate(ws.getDate() + dir * 7)
      return next
    })

  const activeServices = services.filter((x) => x.active)

  return (
    <div className="stack-page manager-bookings">
      <ModuleTitlerow
        lead="Bookings"
        meta={
          <span className="manager-bookings__meta-row">
            <span className="muted">{outletName} · timeline view</span>
            {role !== 'outlet_staff' && (
              <button
                type="button"
                className="btn btn-ghost manager-bookings__configure"
                onClick={() => setConfigure(true)}
              >
                <Settings2 size={15} strokeWidth={2} className="booking-btn-ico" />
                Configure
              </button>
            )}
          </span>
        }
      />

      <div className="mbk-toolbar">
        <button
          type="button"
          className="booking-dot-btn"
          aria-label="Previous week"
          onClick={() => shiftWeek(-1)}
        >
          <ChevronLeft width={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="booking-dot-btn"
          aria-label="Next week"
          onClick={() => shiftWeek(1)}
        >
          <ChevronRight width={16} strokeWidth={2} />
        </button>
        <strong className="mbk-toolbar__range">{weekLabel}</strong>
        <span className="muted mbk-toolbar__total">
          {bookingsInView.length} appointment{bookingsInView.length !== 1 ? 's' : ''}
        </span>
      </div>

      {groupedDays.length === 0 ? (
        <div className="mbk-empty">
          <CalendarClock size={36} strokeWidth={1.3} aria-hidden />
          <p>No bookings this week</p>
        </div>
      ) : (
        <div className="mbk-timeline">
          {groupedDays.map(({ iso, day, bookings: dayBks }) => {
            const { label, sub } = fmtDayLabel(day, todayISO)
            const isToday = iso === todayISO
            return (
              <section key={iso} className={`mbk-day${isToday ? ' mbk-day--today' : ''}`}>
                <div className="mbk-day-header">
                  <div className="mbk-day-header__left">
                    <span className="mbk-day-label">{label}</span>
                    <span className="mbk-day-sub muted">{sub}</span>
                  </div>
                  <span className="muted mbk-day-count">
                    {dayBks.length} booking{dayBks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mbk-day-cards">
                  {dayBks.map((b) => (
                    <BookingRow key={b.id} b={b} svc={svcById.get(b.serviceId)} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {configure ? (
        <div className="booking-modal-overlay configure-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="booking-modal-overlay__backdrop"
            aria-label="Close"
            onClick={() => setConfigure(false)}
          />
          <article className="booking-modal-sheet booking-modal-sheet--dialog configure-sheet">
            <header className="booking-modal-sheet__top booking-modal-sheet__head">
              <div>
                <h2 className="booking-modal-sheet__title">Configure services</h2>
                <p className="muted">
                  Choose which HQ services are offered at <strong>{outletName}</strong> for
                  walk-ins and Booking.
                </p>
              </div>
              <button
                type="button"
                className="booking-icon-toggle"
                onClick={() => setConfigure(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="booking-modal-sheet__body">
              <div className="configure-service-grid">
                {activeServices.map((svc) => {
                  const on = outletServices[outletId]?.[svc.id] !== false
                  return (
                    <div
                      key={svc.id}
                      className={`configure-service-card${on ? '' : ' configure-service-card--off'}`}
                    >
                      <div className="configure-service-card__main">
                        <div className="booking-cell-name">{svc.name}</div>
                        <div className="muted booking-muted configure-service-card__sku">
                          {svc.sku} · RM {svc.price.toFixed(2)} · {svc.durationMin} min
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        className={`configure-service-toggle${on ? ' is-on' : ''}`}
                        onClick={() => setOutletService(outletId, svc.id, !on)}
                      >
                        {on ? 'On' : 'Off'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <footer className="booking-modal-sheet__foot">
              <button
                type="button"
                className="btn btn-primary booking-block-btn"
                onClick={() => setConfigure(false)}
              >
                Done
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </div>
  )
}
