import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type UserRole = 'hq_admin' | 'outlet_manager' | 'outlet_staff' | 'customer'

/** Single outlet for outlet roles (mock — matches booking seed `mv`). */
export type ManagedOutlet = { id: string; name: string }

type SessionState = {
  role: UserRole | null
  setRole: (r: UserRole | null) => void
  login: (r: UserRole) => void
  logout: () => void
  /** Nav group from content-details */
  navGroup: 'hq' | 'staff' | 'customer'
  displayName: string
  subtitle: string
  userInitials: string
  managedOutlet: ManagedOutlet | null
}

const SessionContext = createContext<SessionState | null>(null)

function navGroupForRole(role: UserRole): 'hq' | 'staff' | 'customer' {
  if (role === 'outlet_staff') return 'staff'
  if (role === 'customer') return 'customer'
  return 'hq'
}

function managedOutletForRole(role: UserRole): ManagedOutlet | null {
  if (role === 'outlet_manager' || role === 'outlet_staff') {
    return { id: 'mv', name: 'Mid Valley Mega Mall' }
  }
  return null
}

function profileForRole(role: UserRole): { name: string; subtitle: string; initials: string } {
  switch (role) {
    case 'hq_admin':
      return { name: 'HQ Admin', subtitle: 'Administrator · All outlets', initials: 'HQ' }
    case 'outlet_manager':
      return { name: 'Sarah Lim', subtitle: 'Outlet Manager · MV', initials: 'SL' }
    case 'outlet_staff':
      return { name: 'Ahmad Faizal', subtitle: 'CSHR · ID 0421', initials: 'AF' }
    case 'customer':
      return { name: 'Sarah Lim Wei Ling', subtitle: 'Silver · Mid Valley Cafe', initials: 'SL' }
    default:
      return { name: 'Guest', subtitle: '', initials: '?' }
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    try {
      const s = localStorage.getItem('franchise-os-role')
      if (s === 'hq_admin' || s === 'outlet_manager' || s === 'outlet_staff' || s === 'customer') return s
    } catch {
      /* ignore */
    }
    return null
  })

  const login = useCallback((r: UserRole) => {
    setRole(r)
    try {
      localStorage.setItem('franchise-os-role', r)
    } catch {
      /* ignore */
    }
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem('franchise-os-role')
    } catch {
      /* ignore */
    }
  }, [])

  const navGroup = role ? navGroupForRole(role) : 'hq'
  const p = role ? profileForRole(role) : profileForRole('outlet_manager')
  const managedOutlet = role ? managedOutletForRole(role) : null

  const value = useMemo(
    () => ({
      role,
      setRole,
      login,
      logout,
      navGroup,
      displayName: p.name,
      subtitle: p.subtitle,
      userInitials: p.initials,
      managedOutlet,
    }),
    [role, login, logout, navGroup, p.name, p.subtitle, p.initials, managedOutlet],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession requires SessionProvider')
  return ctx
}
