import { Crown, ChevronLeft, Search } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import {
  REGISTERED_CUSTOMERS,
  getCustomerById,
  getPurchaseHistory,
} from '../data/registered-customers'

export function CustomersPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()

  if (customerId) {
    const c = getCustomerById(customerId)
    if (!c) {
      return (
        <div className="stack-page">
          <p className="muted">Customer not found.</p>
          <button type="button" className="minor-btn" onClick={() => navigate('/customers')}>
            Back to customers
          </button>
        </div>
      )
    }
    const history = getPurchaseHistory(customerId)
    return (
      <div className="stack-page">
        <button
          type="button"
          className="customer-back"
          onClick={() => navigate('/customers')}
        >
          <ChevronLeft size={18} strokeWidth={2} /> Customers
        </button>

        <ModuleTitlerow
          lead="Profile"
          meta={
            <>
              <b>{c.tier}</b> · <b>{c.points}</b> pts · {c.phone}
            </>
          }
        />

        <div className="loyalty-split">
          <div className="profile-card">
            <div className="big-ava">{c.initials}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{c.name}</h2>
            <p className="muted">{c.phone}</p>
            <span
              className="badge tag"
              style={{ letterSpacing: 1.2, fontSize: 9.5, fontWeight: 800 }}
            >
              <Crown size={10} strokeWidth={2} /> {c.tier}
            </span>
            <p style={{ marginTop: 20, fontSize: 24, fontWeight: 800 }}>
              {c.points} <span style={{ fontSize: 14, fontWeight: 500 }}>points</span>
            </p>
            <div style={{ marginTop: 20, display: 'grid', gap: 8, fontSize: 13 }}>
              <div>
                Visits: <strong>{c.visits}</strong>
              </div>
              <div>
                Lifetime: <strong>{c.lifetimeSpend}</strong>
              </div>
              <div>
                Joined: <strong>{c.joined}</strong>
              </div>
            </div>
          </div>
          <article className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Purchase history</div>
                <div className="panel-sub">Orders and redemptions across outlets</div>
              </div>
            </div>
            <ul className="tx-list cm-purchase-list">
              {history.map((t) => (
                <li key={t.id} className="cm-purchase-li">
                  <div className="cm-purchase-head">
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.outlet}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {t.date}
                        {t.type === 'redeem' ? (
                          <span style={{ marginLeft: 8, color: 'var(--accent-2)' }}> · Redemption</span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>RM {Math.abs(t.amount).toFixed(2)}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: t.type === 'redeem' ? 'var(--accent-2)' : 'var(--green)',
                        }}
                      >
                        {t.points} pts
                      </div>
                    </div>
                  </div>
                  {t.lines?.length ? (
                    <table className="mini-lines">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Item</th>
                          <th className="r">Qty</th>
                          <th className="r">Line</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.lines.map((ln) => (
                          <tr key={ln.sku + ln.name}>
                            <td className="mono">{ln.sku}</td>
                            <td>{ln.name}</td>
                            <td className="r">{ln.qty}</td>
                            <td className="r">RM {ln.lineTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    )
  }

  return <CustomersDirectory />
}

function CustomersDirectory() {
  const [q, setQ] = useState('')
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return REGISTERED_CUSTOMERS
    return REGISTERED_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.phone.replace(/\s/g, '').includes(s) ||
        c.id.includes(s),
    )
  }, [q])

  return (
    <div className="stack-page">
      <ModuleTitlerow
        lead="Customers"
        meta={
          <>
            <b>{REGISTERED_CUSTOMERS.length}</b> in network · <b>{rows.length}</b>{' '}
            {rows.length === 1 ? 'match' : 'matches'} · Search below
          </>
        }
      />
      <label className="cm-search">
        <Search width={16} height={16} strokeWidth={2} />
        <input
          placeholder="Search name, phone, or member ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search customers"
        />
      </label>

      <article className="panel">
        <div className="outlets-head">
          <div>
            <div className="panel-title">Customers</div>
            <div className="panel-sub">{rows.length} customer{rows.length === 1 ? '' : 's'}</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="outlets cm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Tier</th>
                <th className="r">Points</th>
                <th className="r">Visits</th>
                <th className="r">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="lead">
                    <Link to={`/customers/${c.id}`} className="cm-name-link">
                      <span className="cm-avatar">{c.initials}</span>
                      <span>
                        <div className="outlet-name">{c.name}</div>
                        <div className="outlet-region">ID · {c.id}</div>
                      </span>
                    </Link>
                  </td>
                  <td>{c.phone}</td>
                  <td>
                    <span className="badge tag">{c.tier}</span>
                  </td>
                  <td className="r mono">{c.points}</td>
                  <td className="r">{c.visits}</td>
                  <td className="r">{c.lifetimeSpend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}
