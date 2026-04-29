import {
  ArrowLeftRight,
  CalendarClock,
  Clock,
  Cpu,
  Settings2,
  Shield,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBookingData } from '../context/BookingDataContext'
import { useCustomerShell } from '../context/CustomerShellContext'
import { useSession } from '../context/SessionContext'
import { formatDateISO } from '../data/booking-mock'
import type { FranchiseService, ScheduledBooking } from '../data/booking-mock'

type BookingTab = 'upcoming' | 'completed'

const CATEGORY_ICONS: Record<string, typeof CalendarClock> = {
  Repair: Wrench,
  Setup: Settings2,
  'Trade-in': ArrowLeftRight,
  Protection: Shield,
  Diagnostics: Cpu,
}

const TAB_LABELS: Record<BookingTab, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
}

function fmtDayLabel(dateISO: string): { label: string; sub: string } {
  try {
    const [y, m, d] = dateISO.split('-').map(Number)
    const target = new Date(y, (m ?? 1) - 1, d ?? 1)
    target.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.round((target.getTime() - today.getTime()) / 864e5)
    const weekday = target.toLocaleDateString('en-MY', { weekday: 'long' })
    const date = target.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
    if (diff === 0) return { label: 'Today', sub: `${weekday}, ${date}` }
    if (diff === 1) return { label: 'Tomorrow', sub: `${weekday}, ${date}` }
    if (diff === -1) return { label: 'Yesterday', sub: `${weekday}, ${date}` }
    return { label: weekday, sub: date }
  } catch {
    return { label: dateISO, sub: '' }
  }
}

function bookingTab(b: ScheduledBooking): BookingTab {
  return b.status === 'confirmed' ? 'upcoming' : 'completed'
}

function BookingTlRow({ b, svc, outletName }: { b: ScheduledBooking; svc?: FranchiseService; outletName: string }) {
  const CatIcon = svc ? (CATEGORY_ICONS[svc.category] ?? CalendarClock) : CalendarClock
  const priceLabel = svc && svc.price > 0 ? `RM ${svc.price.toFixed(2)}` : 'Free'

  return (
    <article className={`cust-tl-row cust-tl-row--${b.status}`}>
      <span className="cust-tl-row__time">{b.time}</span>
      <div className="cust-tl-row__icon" aria-hidden>
        <CatIcon size={15} strokeWidth={1.8} />
      </div>
      <div className="cust-tl-row__body">
        <p className="cust-tl-row__svc">{svc?.name ?? 'Unknown service'}</p>
        <div className="cust-tl-row__meta">
          <span>{outletName}</span>
          {svc ? (
            <>
              <span className="cust-tl-row__dot" aria-hidden>·</span>
              <Clock size={11} strokeWidth={2} aria-hidden />
              <span>{svc.durationMin} min</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="cust-tl-row__trail">
        <span className="cust-tl-row__price">{priceLabel}</span>
        <span className={`cust-tl-status cust-tl-status--${b.status}`}>
          {b.status === 'confirmed' ? 'Upcoming' : 'Done'}
        </span>
      </div>
    </article>
  )
}

export function CustomerMyBookingsPage() {
  const { displayName } = useSession()
  const { bookings, services, outlets } = useBookingData()
  const { topSearch } = useCustomerShell()
  const [tab, setTab] = useState<BookingTab>('upcoming')

  const serviceMap = useMemo(() => {
    const m: Record<string, FranchiseService> = {}
    for (const s of services) m[s.id] = s
    return m
  }, [services])

  const outletMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const o of outlets) m[o.id] = o.name
    return m
  }, [outlets])

  const myBookings = useMemo(
    () => bookings.filter((b) => b.customerName === displayName),
    [bookings, displayName],
  )

  const counts = useMemo(
    () => ({
      upcoming: myBookings.filter((b) => b.status === 'confirmed').length,
      completed: myBookings.filter((b) => b.status !== 'confirmed').length,
    }),
    [myBookings],
  )

  const filtered = useMemo(() => {
    const q = topSearch.trim().toLowerCase()
    return myBookings.filter((b) => {
      if (bookingTab(b) !== tab) return false
      if (!q) return true
      const svc = serviceMap[b.serviceId]
      const outlet = outletMap[b.outletId] ?? ''
      return (
        (svc?.name.toLowerCase().includes(q) ?? false) ||
        (svc?.category.toLowerCase().includes(q) ?? false) ||
        outlet.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      )
    })
  }, [myBookings, tab, topSearch, serviceMap, outletMap])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const b of filtered) {
      if (!map.has(b.dateISO)) map.set(b.dateISO, [])
      map.get(b.dateISO)!.push(b)
    }
    const groups = [...map.entries()].map(([iso, bks]) => ({
      iso,
      bookings: bks.slice().sort((a, b) => a.time.localeCompare(b.time)),
    }))
    return tab === 'upcoming'
      ? groups.sort((a, b) => a.iso.localeCompare(b.iso))
      : groups.sort((a, b) => b.iso.localeCompare(a.iso))
  }, [filtered, tab])

  const todayISO = formatDateISO(new Date())
  const hasSearch = topSearch.trim().length > 0

  return (
    <div className="stack-page stack-page--customer">
      <div className="module-titlerow reveal customer-orders-head">
        <h1>My bookings</h1>
        <div className="customer-order-tabs" role="tablist" aria-label="Booking status">
          {(Object.keys(TAB_LABELS) as BookingTab[]).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`customer-order-tab${tab === k ? ' is-active' : ''}`}
              onClick={() => setTab(k)}
            >
              {TAB_LABELS[k]}
              <span className="customer-order-tab__count">{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customer-orders-meta reveal">
        <p className="muted customer-orders-lead">
          Track your in-store service appointments. Reschedule or cancel at any outlet counter.
        </p>
        <p className="customer-orders-stats">
          <strong>{counts.upcoming}</strong>{' '}
          <span className="muted">upcoming</span>
          <span className="customer-orders-stats__sep" aria-hidden />
          <span className="muted">{myBookings.length} total</span>
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="cust-bookings-empty reveal">
          <CalendarClock size={36} strokeWidth={1.3} aria-hidden />
          <p>
            {tab === 'upcoming'
              ? hasSearch
                ? 'No upcoming bookings match your search.'
                : "You don't have any upcoming appointments. Head to Booking to reserve a slot."
              : hasSearch
                ? 'No completed bookings match your search.'
                : 'No completed appointments yet.'}
          </p>
        </div>
      ) : (
        <div className="cust-tl-timeline reveal">
          {groupedByDate.map(({ iso, bookings: dayBks }) => {
            const { label, sub } = fmtDayLabel(iso)
            const isToday = iso === todayISO
            return (
              <section key={iso} className={`cust-tl-day${isToday ? ' cust-tl-day--today' : ''}`}>
                <div className="cust-tl-day-header">
                  <div className="cust-tl-day-header__left">
                    <span className="cust-tl-day-label">{label}</span>
                    {sub ? <span className="cust-tl-day-sub muted">{sub}</span> : null}
                  </div>
                  <span className="muted cust-tl-day-count">
                    {dayBks.length} booking{dayBks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="cust-tl-cards">
                  {dayBks.map((b) => (
                    <BookingTlRow
                      key={b.id}
                      b={b}
                      svc={serviceMap[b.serviceId]}
                      outletName={outletMap[b.outletId] ?? b.outletId}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
