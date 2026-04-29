import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type CustomerShellValue = {
  topSearch: string
  setTopSearch: (v: string) => void
}

const CustomerShellContext = createContext<CustomerShellValue | null>(null)

export function CustomerShellProvider({ children }: { children: ReactNode }) {
  const [topSearch, setTopSearch] = useState('')
  const value = useMemo(() => ({ topSearch, setTopSearch }), [topSearch])
  return <CustomerShellContext.Provider value={value}>{children}</CustomerShellContext.Provider>
}

export function useCustomerShell() {
  const ctx = useContext(CustomerShellContext)
  if (!ctx) {
    throw new Error('useCustomerShell must be used within CustomerShellProvider')
  }
  return ctx
}
