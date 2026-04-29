import { Bell, ChevronDown, MessageSquare, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { useCustomerShell } from '../context/CustomerShellContext'
import { useSession } from '../context/SessionContext'

export function CustomerTopBar() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { topSearch, setTopSearch } = useCustomerShell()
  const { userInitials, displayName, logout } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    if (pathname === '/shop') {
      const q = new URLSearchParams(search).get('q') ?? ''
      setTopSearch(q)
    }
  }, [pathname, search, setTopSearch])

  const onSearchChange = (v: string) => {
    setTopSearch(v)
    if (pathname === '/shop') {
      const next = new URLSearchParams(search)
      if (v) next.set('q', v)
      else next.delete('q')
      navigate({ pathname: '/shop', search: next.toString() ? `?${next}` : '' }, { replace: true })
    }
  }

  const placeholder =
    pathname === '/shop'
      ? 'Search products, SKU, category…'
      : pathname.startsWith('/my-orders')
        ? 'Search order ID…'
        : 'Search…'

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="pos-topbar customer-topbar">
      <div className="customer-topbar__left">
        <NavLink to="/shop" className="brand" onClick={() => setMenuOpen(false)}>
          <div className="brand-mark">F</div>
          <div className="brand-text">
            <strong className="brand-name">Franchise OS</strong>
            <span className="brand-outlet">Mid Valley Cafe</span>
          </div>
        </NavLink>
        <nav className="customer-topbar__nav" aria-label="Main">
          <NavLink
            to="/shop"
            className={({ isActive }) => `customer-topbar__nav-link${isActive ? ' is-active' : ''}`}
          >
            Shop
          </NavLink>
          <NavLink
            to="/my-orders"
            className={() =>
              `customer-topbar__nav-link${
                pathname === '/my-orders' || pathname.startsWith('/my-orders/') ? ' is-active' : ''
              }`
            }
          >
            My orders
          </NavLink>
        </nav>
      </div>

      <label className="customer-topbar__search">
        <Search width={18} height={18} strokeWidth={2} aria-hidden />
        <input
          value={topSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
        />
      </label>

      <div className="topbar-right customer-topbar__right">
        <div className="pos-topbar-quick">
          <NavLink
            to="/ai-customer-chat"
            className={({ isActive }) => `bell pos-bell${isActive ? ' bell--active' : ''}`}
            aria-label="Help and chat"
            title="Help and chat"
          >
            <MessageSquare width={16} height={16} strokeWidth={2} />
          </NavLink>
          <ThemeToggle className="bell pos-bell" />
          <button type="button" className="bell pos-bell" aria-label="Notifications">
            <Bell width={16} height={16} strokeWidth={2} />
            <span className="dot" />
          </button>
        </div>

        <div className="customer-avatar-wrap" ref={menuRef}>
          <button
            type="button"
            className="customer-avatar-btn"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="customer-avatar-initials">{userInitials}</span>
            <ChevronDown width={14} height={14} strokeWidth={2} aria-hidden />
          </button>
          {menuOpen ? (
            <div className="customer-avatar-menu" role="menu">
              <div className="customer-avatar-menu__who">
                <span className="customer-avatar-menu__name">{displayName}</span>
                <span className="muted customer-avatar-menu__sub">Member</span>
              </div>
              <NavLink
                to="/customer-portal?tab=profile"
                role="menuitem"
                className="customer-avatar-menu__item"
                onClick={() => setMenuOpen(false)}
              >
                My profile
              </NavLink>
              <NavLink
                to="/customer-portal"
                role="menuitem"
                className="customer-avatar-menu__item"
                onClick={() => setMenuOpen(false)}
              >
                Loyalty
              </NavLink>
              <button type="button" role="menuitem" className="customer-avatar-menu__item danger" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
