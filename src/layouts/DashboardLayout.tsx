import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Award,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquare,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import { CustomerShellProvider } from '../context/CustomerShellContext'
import { NotificationProvider } from '../context/NotificationContext'
import { useSession } from '../context/SessionContext'
import content from '../data/content-details.json'
import { NotificationPanel } from '../components/NotificationPanel'
import { CustomerTopBar } from './CustomerTopBar'
import { DashboardTopBar } from './DashboardTopBar'

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  ShoppingCart,
  Boxes: Package,
  Users,
  Award,
  MessageSquare,
  Building2,
  ClipboardList,
  ShoppingBag,
  Truck,
  CalendarRange,
  CalendarClock,
  CalendarDays,
  Layers,
  SparklesNested: Sparkles,
}

export function DashboardLayout() {
  const { navGroup, role, displayName, subtitle, userInitials, logout } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isCustomerShell = navGroup === 'customer'
  const isPosLike = pathname === '/pos'

  const items = useMemo(() => {
    const raw =
      navGroup === 'staff'
        ? content.sharedComponents.sidebar.navItemsByRole.staff
        : navGroup === 'customer'
          ? content.sharedComponents.sidebar.navItemsByRole.customer
          : content.sharedComponents.sidebar.navItemsByRole.hq

    if (role === 'hq_admin') {
      return raw.filter(
        (i) =>
          !['pos', 'store-orders', 'bookings'].includes(i.key),
      )
    }
    if (role === 'outlet_manager') {
      return raw.filter((i) => i.key !== 'services')
    }
    return raw
  }, [navGroup, role])

  const itemHref = (key: string) =>
    key === 'customer-portal'
      ? '/customer-portal'
      : key === 'book'
        ? '/book'
        : key === 'shop'
          ? '/shop'
          : `/${key}`

  const sectionLabel =
    navGroup === 'staff' ? 'Outlet Tools' : navGroup === 'customer' ? 'My Account' : 'Workspace'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const shell = (
    <>
      {!isCustomerShell ? (
        <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div className="brand-text">
            <span className="brand-name">Franchise OS</span>
            <span className="brand-outlet">Mid Valley Cafe</span>
          </div>
        </div>

        <div>
          <div className="nav-section">{sectionLabel}</div>
          <nav className="nav">
            {items.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard
              const isLive =
                item.key === 'dashboard' ||
                (navGroup === 'staff' && item.key === 'pos')
              const invCount = item.key === 'inventory'
              return (
                <NavLink
                  key={item.key}
                  to={itemHref(item.key)}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <Icon strokeWidth={2} />
                  {item.label}
                  {isLive ? <span className="nav-tag">LIVE</span> : null}
                  {invCount ? (
                    <span
                      className="nav-tag"
                      style={{
                        background: 'rgba(243,156,18,0.18)',
                        color: 'var(--tone-amber)',
                      }}
                    >
                      5
                    </span>
                  ) : null}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="user-block">
          <NavLink
            to="/my-profile"
            title="My profile"
            aria-label={`My profile (${displayName})`}
            className={({ isActive }) => `user-block-hit${isActive ? ' user-block-hit--active' : ''}`}
          >
            <div className="avatar">{userInitials}</div>
            <div className="who">
              <strong>{displayName}</strong>
              <span>{subtitle}</span>
            </div>
          </NavLink>
          <button type="button" className="logout" aria-label="Log out" onClick={handleLogout}>
            <LogOut width={14} height={14} strokeWidth={2} />
          </button>
        </div>
      </aside>
      ) : null}

      <main className="main">
        {isCustomerShell ? (
          <CustomerShellProvider>
            <CustomerTopBar />
            <div className="main-body main-body--customer">
              <Outlet />
            </div>
          </CustomerShellProvider>
        ) : (
          <>
            {!isPosLike ? <DashboardTopBar /> : null}
            <div className={`main-body${isPosLike ? ' main-body--pos' : ''}`}>
              <Outlet />
            </div>
          </>
        )}
      </main>
    </>
  )

  return (
    <NotificationProvider>
      <div className={`app${isCustomerShell ? ' app--customer' : ''}`}>{shell}</div>
      <NotificationPanel />
    </NotificationProvider>
  )
}
