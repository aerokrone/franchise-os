import { Building2, Store, User, UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import content from '../data/content-details.json'
import { useSession, type UserRole } from '../context/SessionContext'
import { LoginRedirect } from '../components/ProtectedRoute'
import { ThemeToggle } from '../components/ThemeToggle'

const icons = {
  Building2,
  Store,
  User,
  UserCircle2,
}

export function LoginPage() {
  const { login } = useSession()
  const navigate = useNavigate()
  const loginContent = content.pages.login

  const handleRole = (navigatesTo: string, mapTo: UserRole) => {
    login(mapTo)
    if (navigatesTo === 'pos') navigate('/pos')
    else if (navigatesTo === 'shop' || navigatesTo === 'customer-portal') navigate('/shop')
    else navigate('/dashboard')
  }

  return (
    <div className="login-root">
      <LoginRedirect />
      <ThemeToggle className="theme-toggle theme-toggle--login" />
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">F</div>
          <div>
            <h1>Franchise OS</h1>
            <p className="tagline">
              {(loginContent.elements.find((e) => e.id === 'logo-section')?.content as string) ??
                'The AI-powered operating system for franchise businesses'}
            </p>
          </div>
        </div>

        {loginContent.elements.map((el) => {
          if (el.id === 'email-field') {
            return (
              <div key={el.id} className="login-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  defaultValue={(el.content as string) ?? ''}
                />
              </div>
            )
          }
          if (el.id === 'password-field') {
            return (
              <div key={el.id} className="login-field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" />
              </div>
            )
          }
          if (el.id === 'role-selector') {
            const opts = el.content as {
              label: string
              icon: keyof typeof icons
              navigatesTo: string
            }[]
            const roleMap: UserRole[] = ['hq_admin', 'outlet_manager', 'outlet_staff', 'customer']
            return (
              <div key={el.id}>
                <div className="login-field">
                  <label>Sign in as</label>
                </div>
                <div className="role-grid">
                  {opts.map((opt, i) => {
                    const Icon = icons[opt.icon]
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        className="role-btn"
                        onClick={() => handleRole(opt.navigatesTo, roleMap[i])}
                      >
                        <Icon strokeWidth={2} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
