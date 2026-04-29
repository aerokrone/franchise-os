import { Bell, Search, Sparkles } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { useSession } from '../context/SessionContext'

const titles: Record<string, { crumb: string[]; search: string }> = {
  '/dashboard': {
    crumb: ['Outlet', 'Mid Valley', 'Operations'],
    search: 'Search products, transactions, customers…',
  },
  '/ai-bi': {
    crumb: ['HQ', 'Insights', 'AI BI'],
    search: 'Ask outlets, SKUs, sales…',
  },
  '/inventory': {
    crumb: ['Outlet', 'Mid Valley', 'Inventory'],
    search: 'Search SKUs, batches…',
  },
  '/inventory-hq': {
    crumb: ['Network', 'HQ Warehouse', 'Supply'],
    search: 'Search SKUs, allocations, dispatch…',
  },
  '/customers': {
    crumb: ['Network', 'Customers', 'List'],
    search: 'Search registered customers…',
  },
  '/customers-profile': {
    crumb: ['Network', 'Customers', 'Profile'],
    search: 'Search line items, dates…',
  },
  '/customer-portal': {
    crumb: ['You', 'Mid Valley Cafe', 'Loyalty'],
    search: 'Search rewards…',
  },
  '/ai-customer-chat': {
    crumb: ['Support', 'Assistant', 'Chat'],
    search: 'Search help topics…',
  },
  '/shop': {
    crumb: ['You', 'Shop', 'Browse'],
    search: 'Search products, SKU…',
  },
  '/my-orders': {
    crumb: ['You', 'Orders', 'Tracking'],
    search: 'Search order ID…',
  },
  '/store-orders': {
    crumb: ['Outlet', 'Mid Valley', 'Orders'],
    search: 'Search order, customer…',
  },
}

export function DashboardTopBar() {
  const { pathname } = useLocation()
  const { navGroup, role } = useSession()

  const cfg = useMemo(() => {
    if (pathname.startsWith('/customers/')) {
      return titles['/customers-profile']
    }
    if (pathname === '/customers') {
      return titles['/customers']
    }
    if (pathname.startsWith('/inventory/')) {
      if (role === 'hq_admin') {
        return {
          crumb: ['Network', 'Inventory', 'SKU detail'],
          search: 'Search policy, batches…',
        }
      }
      return {
        crumb: ['Outlet', 'Mid Valley', 'SKU detail'],
        search: 'Search adjustments…',
      }
    }
    if (pathname === '/inventory' && role === 'hq_admin') {
      return titles['/inventory-hq']
    }
    return titles[pathname] ?? titles['/dashboard']
  }, [pathname, role])

  return (
    <header className="topbar">
      <div className="crumb">
        <span>{cfg.crumb[0]}</span> <span className="sep">/</span>
        <span>{cfg.crumb[1]}</span> <span className="sep">/</span>
        <span className="here">{cfg.crumb[2]}</span>
      </div>
      <label className="search">
        <Search width={16} height={16} strokeWidth={2} />
        <input placeholder={cfg.search} aria-label="Search" />
        <kbd>⌘K</kbd>
      </label>
      <div className="topbar-trail">
        {navGroup === 'hq' ? (
          <NavLink
            to="/ai-bi"
            className={({ isActive }) => `bell${isActive ? ' bell--active' : ''}`}
            aria-label="AI Insights"
            title="AI Insights"
          >
            <Sparkles width={16} height={16} strokeWidth={2} />
          </NavLink>
        ) : null}
        <ThemeToggle className="bell" />
        <button type="button" className="bell" aria-label="Notifications">
          <Bell width={16} height={16} strokeWidth={2} />
          <span className="dot" />
        </button>
      </div>
    </header>
  )
}
