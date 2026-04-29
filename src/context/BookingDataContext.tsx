import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  type FranchiseService,
  type OutletServicesMap,
  type ScheduledBooking,
  INITIAL_SERVICES,
  seedBookings,
  seedOutletServicesMap,
  OUTLETS,
} from '../data/booking-mock'

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

type BookingDraft = Omit<ScheduledBooking, 'id'> & { id?: string }

type BookingCtx = {
  outlets: typeof OUTLETS
  /** HQ-managed catalogue */
  services: FranchiseService[]
  setServices: React.Dispatch<React.SetStateAction<FranchiseService[]>>
  outletServices: OutletServicesMap
  setOutletService: (outletId: string, serviceId: string, enabled: boolean) => void
  bookings: ScheduledBooking[]
  addBooking: (draft: BookingDraft) => ScheduledBooking
  updateBookingStatus: (id: string, status: ScheduledBooking['status']) => void
  upsertService: (svc: FranchiseService, prevId?: string) => void
  removeService: (serviceId: string) => void
}

const BookingCtx = createContext<BookingCtx | null>(null)

export function BookingDataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FranchiseService[]>(() => [...INITIAL_SERVICES])
  const [outletServices, setOutletServices] = useState<OutletServicesMap>(() =>
    seedOutletServicesMap(),
  )
  const [bookings, setBookings] = useState<ScheduledBooking[]>(() => seedBookings())

  const setOutletService = useCallback(
    (outletId: string, serviceId: string, enabled: boolean) => {
      setOutletServices((prev) => ({
        ...prev,
        [outletId]: { ...prev[outletId], [serviceId]: enabled },
      }))
    },
    [],
  )

  const addBooking = useCallback((draft: BookingDraft) => {
    const row: ScheduledBooking = {
      id: draft.id ?? uid('bk'),
      serviceId: draft.serviceId,
      outletId: draft.outletId,
      dateISO: draft.dateISO,
      time: draft.time,
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      source: draft.source,
      status: draft.status ?? 'confirmed',
    }
    setBookings((prev) => [row, ...prev])
    return row
  }, [])

  const updateBookingStatus = useCallback((id: string, status: ScheduledBooking['status']) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }, [])

  const upsertService = useCallback((svc: FranchiseService, prevId?: string) => {
    setServices((prev) => {
      if (prevId && prevId !== svc.id) {
        return [...prev.filter((s) => s.id !== prevId), svc]
      }
      const i = prev.findIndex((s) => s.id === svc.id)
      if (i < 0) return [...prev, svc]
      const next = [...prev]
      next[i] = svc
      return next
    })

    setOutletServices((prev) => {
      const next: OutletServicesMap = { ...prev }
      for (const o of OUTLETS) {
        const row = { ...next[o.id] }
        if (prevId && prevId !== svc.id) {
          delete row[prevId]
        }
        row[svc.id] = row[svc.id] ?? true
        next[o.id] = row
      }
      return next
    })
  }, [])

  const removeService = useCallback((serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, active: false } : s)),
    )
  }, [])

  const value = useMemo(
    () => ({
      outlets: OUTLETS,
      services,
      setServices,
      outletServices,
      setOutletService,
      bookings,
      addBooking,
      updateBookingStatus,
      upsertService,
      removeService,
    }),
    [
      services,
      outletServices,
      bookings,
      setOutletService,
      addBooking,
      updateBookingStatus,
      upsertService,
      removeService,
    ],
  )

  return <BookingCtx.Provider value={value}>{children}</BookingCtx.Provider>
}

export function useBookingData(): BookingCtx {
  const c = useContext(BookingCtx)
  if (!c) throw new Error('useBookingData requires BookingDataProvider')
  return c
}
