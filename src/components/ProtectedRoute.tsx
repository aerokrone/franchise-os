import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession, type UserRole } from '../context/SessionContext'

function isInventoryPath(path: string) {
  return path === '/inventory' || path.startsWith('/inventory/')
}

function defaultHome(role: UserRole): string {
  if (role === 'outlet_staff') return '/pos'
  if (role === 'customer') return '/shop'
  return '/dashboard'
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { role } = useSession()
  const loc = useLocation()
  const path = loc.pathname

  if (!role) {
    return <Navigate to="/" replace state={{ from: path }} />
  }

  if (role === 'outlet_staff') {
    if (
      path === '/pos' ||
      path === '/bookings' ||
      isInventoryPath(path) ||
      path === '/store-orders' ||
      path.startsWith('/my-profile')
    ) {
      return <>{children}</>
    }
    return <Navigate to="/pos" replace />
  }

  if (role === 'customer') {
    const allowedExact = new Set([
      '/customer-portal',
      '/ai-customer-chat',
      '/shop',
      '/book',
      '/my-orders',
      '/my-bookings',
      '/my-profile',
    ])
    const okDetail = /^\/my-orders\/[^/]+$/.test(path)
    const okProfile = path.startsWith('/my-profile')
    if (allowedExact.has(path) || okDetail || okProfile) return <>{children}</>
    return <Navigate to="/shop" replace />
  }

  if (role === 'hq_admin') {
    if (path === '/pos' || path === '/bookings') {
      return <Navigate to="/dashboard" replace />
    }
    const ok =
      path === '/dashboard' ||
      path === '/ai-bi' ||
      path === '/services' ||
      isInventoryPath(path) ||
      path.startsWith('/customers') ||
      path === '/store-orders' ||
      path.startsWith('/my-profile')
    if (ok) return <>{children}</>
    return <Navigate to="/dashboard" replace />
  }

  if (role === 'outlet_manager') {
    if (path === '/services') {
      return <Navigate to="/dashboard" replace />
    }
    const ok =
      path === '/dashboard' ||
      path === '/ai-bi' ||
      path === '/pos' ||
      path === '/bookings' ||
      isInventoryPath(path) ||
      path.startsWith('/customers') ||
      path === '/store-orders' ||
      path.startsWith('/my-profile')
    if (ok) return <>{children}</>
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function LoginRedirect() {
  const { role } = useSession()
  if (!role) return null
  return <Navigate to={defaultHome(role)} replace />
}
