import { Bell, CheckCheck, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useNotifications, type Notification } from '../context/NotificationContext'

const dotColor: Record<string, string> = {
  critical: 'var(--tone-lava)',
  warning: 'var(--tone-amber)',
  success: 'var(--green)',
  info: 'var(--tone-sky)',
}

function NotifItem({ n, idx }: { n: Notification; idx: number }) {
  return (
    <div
      className={`notif-item notif-item--${n.severity}${n.read ? ' notif-item--read' : ''}`}
      style={{ '--notif-idx': idx } as CSSProperties}
    >
      <span className="notif-dot" style={{ background: dotColor[n.severity] }} aria-hidden />
      <div className="notif-body">
        <p className="notif-title">{n.title}</p>
        <p className="notif-text">{n.body}</p>
        <span className="notif-ts">{n.ts}</span>
      </div>
    </div>
  )
}

export function NotificationPanel() {
  const { open, close, notifications, unreadCount, markAllRead } = useNotifications()

  return (
    <>
      <div
        className={`notif-backdrop${open ? ' notif-backdrop--open' : ''}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`notif-panel${open ? ' notif-panel--open' : ''}`}
        aria-label="Notifications"
        aria-hidden={!open}
      >
        <div className="notif-head">
          <div className="notif-head__left">
            <Bell width={15} height={15} strokeWidth={2} aria-hidden />
            <span className="notif-head__title">Notifications</span>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>
          <div className="notif-head__actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-action-btn"
                onClick={markAllRead}
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck width={14} height={14} strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              className="notif-action-btn"
              onClick={close}
              aria-label="Close notifications"
            >
              <X width={15} height={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="notif-list" role="list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <Bell width={28} height={28} strokeWidth={1.5} aria-hidden />
              <span>All caught up</span>
            </div>
          ) : (
            notifications.map((n, i) => <NotifItem key={n.id} n={n} idx={i} />)
          )}
        </div>

        <div className="notif-foot">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All notifications read'}
        </div>
      </aside>
    </>
  )
}
