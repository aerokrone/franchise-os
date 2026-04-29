import { useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import { useSession } from '../context/SessionContext'
import type { UserRole } from '../context/SessionContext'

function profileDefaults(role: UserRole | null): {
  username: string
  fullName: string
  maskedEmail: string
  maskedPhone: string
  genderDefault: 'male' | 'female' | 'other'
} {
  switch (role) {
    case 'hq_admin':
      return {
        username: 'hq.admin.fc',
        fullName: 'HQ Admin',
        maskedEmail: 'hq*******@franchiseos.com',
        maskedPhone: '+\u2009**\u2009*\u2009**\u2009**\u200942',
        genderDefault: 'other',
      }
    case 'outlet_staff':
      return {
        username: 'a.faizal.cshr',
        fullName: 'Ahmad Faizal',
        maskedEmail: 'ah*******@staff.local',
        maskedPhone: '*\u2009*\u2009*\u2009*\u2009**\u200921',
        genderDefault: 'male',
      }
    case 'customer':
      return {
        username: 's.lim.customer',
        fullName: 'Sarah Lim Wei Ling',
        maskedEmail: 'sa**************@email.com',
        maskedPhone: '*\u2009*\u2009*\u2009**\u2009**\u200989',
        genderDefault: 'female',
      }
    default:
      return {
        username: 'sarah.lim.mgr',
        fullName: 'Sarah Lim',
        maskedEmail: 'sa**************@franchiseos.com',
        maskedPhone: '*\u2009*\u2009**\u2009**\u200903',
        genderDefault: 'female',
      }
  }
}

function MyProfileRailLink({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `my-profile-rail__link${isActive ? ' my-profile-rail__link--active' : ''}`
      }
    >
      {children}
    </NavLink>
  )
}

function MyProfileTabLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `my-profile-tabnav__link${isActive ? ' is-active' : ''}`}
    >
      {children}
    </NavLink>
  )
}

function ProfileTab() {
  const { role, userInitials, displayName } = useSession()
  const defs = useMemo(() => profileDefaults(role), [role])

  const [fullName, setFullName] = useState(defs.fullName)
  const [gender, setGender] = useState(defs.genderDefault)

  return (
    <>
      <div className="my-profile-columns">
        <div className="my-profile-fields my-profile-fields--block">
          <fieldset className="my-profile-fields__fieldset">
            <legend className="sr-only">Account details</legend>

            <label className="my-profile-field my-profile-field--readonly">
              <span className="my-profile-field__lab">Username</span>
              <span className="my-profile-field__readonly">{defs.username}</span>
            </label>

            <label className="my-profile-field">
              <span className="my-profile-field__lab">Name</span>
              <input
                className="my-profile-field__input"
                value={fullName}
                autoComplete="name"
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>

            <div className="my-profile-field my-profile-field--inline">
              <span className="my-profile-field__lab">Email</span>
              <div className="my-profile-field__masked">
                <span>{defs.maskedEmail}</span>
                <button type="button" className="my-profile-field__action">
                  Change
                </button>
              </div>
            </div>

            <div className="my-profile-field my-profile-field--inline">
              <span className="my-profile-field__lab">Phone</span>
              <div className="my-profile-field__masked">
                <span>{defs.maskedPhone}</span>
                <button type="button" className="my-profile-field__action">
                  Change
                </button>
              </div>
            </div>

            <div className="my-profile-field my-profile-field--radios">
              <span className="my-profile-field__lab">Gender</span>
              <div className="my-profile-radios" role="radiogroup" aria-label="Gender">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <label key={g} className="my-profile-radio">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                    />
                    <span>{g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        </div>

        <div className="my-profile-photo" aria-labelledby="photo-heading">
          <p id="photo-heading" className="sr-only">
            Profile photo
          </p>
          <div className="my-profile-photo__avatar">{userInitials.slice(0, 2)}</div>
          <button type="button" className="btn btn-ghost">
            Select image
          </button>
          <p className="muted my-profile-photo__hint">
            File size: max 1&nbsp;MB · .JPEG · .PNG
          </p>
        </div>
      </div>

      <footer className="my-profile-footer">
        <p className="muted my-profile-footer__note">
          Signed in as <strong>{displayName}</strong> · Demo form only; no data is saved.
        </p>
        <div className="my-profile-footer__actions">
          <button type="button" className="btn btn-primary">
            Save
          </button>
        </div>
      </footer>
    </>
  )
}

function PasswordForm() {
  const { displayName } = useSession()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  return (
    <form
      className="my-profile-security"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <p className="my-profile-security__lead muted">
        Use a strong password you don&apos;t use elsewhere. Demo only — nothing is verified or saved.
      </p>

      <fieldset className="my-profile-fields__fieldset">
        <legend className="sr-only">Change password</legend>

        <label className="my-profile-field my-profile-field--stack">
          <span className="my-profile-field__lab">Current password</span>
          <input
            type="password"
            className="my-profile-field__input"
            name="current-password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>

        <label className="my-profile-field my-profile-field--stack">
          <span className="my-profile-field__lab">New password</span>
          <input
            type="password"
            className="my-profile-field__input"
            name="new-password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>

        <label className="my-profile-field my-profile-field--stack">
          <span className="my-profile-field__lab">Confirm new password</span>
          <input
            type="password"
            className="my-profile-field__input"
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        <p className="my-profile-note my-profile-security__hint">
          At least 8 characters · mix letters &amp; numbers in production policies.
        </p>
      </fieldset>

      <footer className="my-profile-footer">
        <p className="muted my-profile-footer__note">
          Signed in as <strong>{displayName}</strong> · Demo only — passwords are not verified or saved.
        </p>
        <div className="my-profile-footer__actions">
          <button type="submit" className="btn btn-primary">
            Update password
          </button>
        </div>
      </footer>
    </form>
  )
}

export default function MyProfilePage() {
  const { role, navGroup, displayName, userInitials, subtitle } = useSession()
  const isCustomerShell = navGroup === 'customer'

  const meta = <span className="muted">Manage and protect your account.</span>

  return (
    <div className={`stack-page my-profile-page${isCustomerShell ? ' stack-page--customer' : ''}`}>
      <ModuleTitlerow lead="My profile" meta={meta} />

      {isCustomerShell ? (
        <nav className="my-profile-tabnav" aria-label="Account">
          <MyProfileTabLink to="/my-profile" end>
            Profile
          </MyProfileTabLink>
          <MyProfileTabLink to="/my-profile/security">Security &amp; passwords</MyProfileTabLink>
        </nav>
      ) : null}

      <div className={`my-profile-layout${role === 'customer' ? ' my-profile-layout--customer' : ''}`}>
        {role !== 'customer' ? (
          <aside className="my-profile-rail" aria-label="Account sections">
            <div className="my-profile-rail__user">
              <div className="my-profile-rail__avatar">{userInitials.slice(0, 2)}</div>
              <div className="my-profile-rail__meta">
                <span className="my-profile-rail__name">{displayName}</span>
                <div className="my-profile-rail__role">
                  <span className="my-profile-rail__role-label">Role</span>
                  <span className="my-profile-rail__role-value">{subtitle}</span>
                </div>
              </div>
            </div>
            <nav className="my-profile-rail__nav">
              <div className="my-profile-rail__cat">Account</div>
              <MyProfileRailLink to="/my-profile" end>
                Profile
              </MyProfileRailLink>
              <MyProfileRailLink to="/my-profile/security">Security &amp; passwords</MyProfileRailLink>
            </nav>
          </aside>
        ) : null}

        <div className="my-profile-card panel">
          <Routes>
            <Route index element={<ProfileTab />} />
            <Route path="security" element={<PasswordForm />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
