import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSession, type UserRole } from './SessionContext'

export type NotifSeverity = 'critical' | 'warning' | 'success' | 'info'

export type Notification = {
  id: string
  severity: NotifSeverity
  title: string
  body: string
  ts: string
  read: boolean
}

function seedNotifications(role: UserRole | null): Notification[] {
  switch (role) {
    case 'hq_admin':
      return [
        {
          id: 'hq-1',
          severity: 'critical',
          title: '3 outlets below stock par',
          body: 'Penang, KL Sentral & 1 Utama are below minimum threshold on 5+ SKUs. Replenishment required.',
          ts: '5 min ago',
          read: false,
        },
        {
          id: 'hq-2',
          severity: 'warning',
          title: 'Franchise application pending',
          body: 'New outlet application from Johor Bahru is awaiting HQ review and sign-off.',
          ts: '22 min ago',
          read: false,
        },
        {
          id: 'hq-3',
          severity: 'warning',
          title: '2 inventory requests unreviewed',
          body: 'Mid Valley & 1 Utama submitted replenishment requests REQ-MV-001 and REQ-1U-004 pending approval.',
          ts: '1 hr ago',
          read: false,
        },
        {
          id: 'hq-4',
          severity: 'success',
          title: 'Q1 revenue target reached',
          body: '4 of 5 outlets hit their Q1 targets. Network-wide revenue is up 18% YoY — strong Accessories growth.',
          ts: '2 hr ago',
          read: false,
        },
        {
          id: 'hq-5',
          severity: 'info',
          title: 'AI-BI weekly digest ready',
          body: 'Your personalised sales velocity report and top anomaly highlights are ready to view in Insights.',
          ts: '4 hr ago',
          read: true,
        },
        {
          id: 'hq-6',
          severity: 'success',
          title: 'New service live across network',
          body: '"Gaming Laptop Tune-Up" is now enabled at all 5 outlets following HQ review and activation.',
          ts: 'Yesterday',
          read: true,
        },
      ]

    case 'outlet_manager':
      return [
        {
          id: 'mgr-1',
          severity: 'critical',
          title: 'Low stock — iPhone 15 Pro (128GB)',
          body: 'Only 3 units remaining, below the outlet par of 8. Draft a replenishment request to HQ now.',
          ts: '3 min ago',
          read: false,
        },
        {
          id: 'mgr-2',
          severity: 'warning',
          title: 'Appointment cancelled — 14:30',
          body: 'Marcus Tee cancelled his Gaming Laptop Tune-Up slot at 14:30. The slot is now open for walk-ins.',
          ts: '18 min ago',
          read: false,
        },
        {
          id: 'mgr-3',
          severity: 'info',
          title: '4 appointments on today\'s board',
          body: 'Next: Sarah Lim — Device Diagnostic at 11:00. Three more in the afternoon queue.',
          ts: '45 min ago',
          read: false,
        },
        {
          id: 'mgr-4',
          severity: 'warning',
          title: '2 requests pending HQ',
          body: 'Your inventory requests REQ-20260428-MV-001 and MV-002 are awaiting HQ approval.',
          ts: '2 hr ago',
          read: true,
        },
        {
          id: 'mgr-5',
          severity: 'success',
          title: 'Weekly sales report ready',
          body: 'This week: RM 48,320 revenue. Up 12% vs last week. Accessories is leading growth at +24%.',
          ts: 'Yesterday',
          read: true,
        },
      ]

    case 'outlet_staff':
      return [
        {
          id: 'stf-1',
          severity: 'critical',
          title: 'Receipt printer offline — POS-2',
          body: 'POS-2 receipt printer is not responding. Switch to POS-1 or issue e-receipts until resolved.',
          ts: '2 min ago',
          read: false,
        },
        {
          id: 'stf-2',
          severity: 'warning',
          title: '3 customers at the counter',
          body: 'Walk-in queue is building up. Consider opening the secondary service lane to manage wait time.',
          ts: '10 min ago',
          read: false,
        },
        {
          id: 'stf-3',
          severity: 'info',
          title: 'Next appointment: 13:30',
          body: 'Walk-in — New Device Setup & Data Migration · 45 min. Prepare the data transfer cable and station.',
          ts: '30 min ago',
          read: false,
        },
        {
          id: 'stf-4',
          severity: 'info',
          title: 'End-of-day cash count at 22:00',
          body: 'Please reconcile POS-1 and POS-2 registers before closing the floor tonight.',
          ts: '1 hr ago',
          read: true,
        },
        {
          id: 'stf-5',
          severity: 'success',
          title: 'Shift started — 09:00 logged',
          body: 'Good morning, Ahmad! Your shift runs until 18:00. 5 appointments are on the board today.',
          ts: '3 hr ago',
          read: true,
        },
      ]

    case 'customer':
      return [
        {
          id: 'cust-1',
          severity: 'success',
          title: 'Booking confirmed',
          body: 'Device Diagnostic & Health Check · Mon 28 Apr · 11:00 · Mid Valley Mega Mall. See you then!',
          ts: '5 min ago',
          read: false,
        },
        {
          id: 'cust-2',
          severity: 'warning',
          title: 'Appointment reminder — tomorrow',
          body: 'Your 11:00 Device Diagnostic is tomorrow at Mid Valley. Remember to bring your device and charger.',
          ts: '1 hr ago',
          read: false,
        },
        {
          id: 'cust-3',
          severity: 'info',
          title: '350 pts away from Gold tier',
          body: 'You have 2,150 loyalty points. Earn 350 more to unlock Gold benefits including free diagnostics.',
          ts: '2 hr ago',
          read: false,
        },
        {
          id: 'cust-4',
          severity: 'info',
          title: 'Weekend promo — Screen Protector',
          body: '15% off Precision Screen Protector Install this Saturday & Sunday at all outlets. Book now.',
          ts: 'Yesterday',
          read: true,
        },
        {
          id: 'cust-5',
          severity: 'info',
          title: 'Trade-in appraisal available',
          body: 'Your device is eligible for a trade-in. Schedule a free appraisal appointment at any outlet.',
          ts: '2 days ago',
          read: true,
        },
      ]

    default:
      return []
  }
}

type NotifCtxValue = {
  open: boolean
  toggle: () => void
  close: () => void
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void
}

const NotifCtx = createContext<NotifCtxValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { role } = useSession()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    seedNotifications(role),
  )

  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  )

  const value = useMemo(
    () => ({ open, toggle, close, notifications, unreadCount, markAllRead }),
    [open, toggle, close, notifications, unreadCount, markAllRead],
  )

  return <NotifCtx.Provider value={value}>{children}</NotifCtx.Provider>
}

export function useNotifications(): NotifCtxValue {
  const ctx = useContext(NotifCtx)
  if (!ctx) throw new Error('useNotifications requires NotificationProvider')
  return ctx
}
