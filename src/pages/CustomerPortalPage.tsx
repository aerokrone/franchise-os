import { Crown, User } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'
import content from '../data/content-details.json'
import { ModuleTitlerow } from '../components/ModuleTitlerow'

const page = content.pages['customer-portal'] as typeof content.pages['customer-portal'] & {
  moduleTitlerow?: { lead: string }
}

export function CustomerPortalPage() {
  const [sp] = useSearchParams()
  if (sp.get('tab') === 'profile') {
    return <Navigate to="/my-profile" replace />
  }

  const hero = page.elements.find((e) => e.id === 'hero-card')!.content as {
    tierLabel: string
    pointsDisplay: string
    conversion: string
  }
  const statsEl = page.elements.find((e) => e.id === 'customer-stats')!
  const statList = (statsEl.content as { stats: { label: string; value: string }[] }).stats

  return (
    <div className="stack-page stack-page--customer">
      <ModuleTitlerow
        lead={page.moduleTitlerow?.lead ?? 'Loyalty'}
        meta={
          <>
            <User size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.75 }} />
            {hero.tierLabel} · {hero.pointsDisplay}
          </>
        }
      />
      <section className="hero-loyalty reveal" style={{ position: 'relative' }}>
        <Crown
          size={40}
          strokeWidth={1.5}
          style={{ position: 'absolute', top: 24, right: 28, opacity: 0.25 }}
        />
        <p className="muted">{hero.tierLabel}</p>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{hero.pointsDisplay}</h2>
        <p style={{ marginTop: 8 }}>{hero.conversion}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary">
            Redeem now
          </button>
          <button type="button" className="btn btn-ghost">
            View rewards
          </button>
        </div>
      </section>
      <div className="portal-grid">
        <section className="stack-section">
          <h2>Path to Gold tier</h2>
          <p className="muted">Earn 2× points on every transaction</p>
          <p style={{ marginTop: 16 }}>
            11,580 lifetime points needed for Gold. At your current pace (~250 pts/month), about 46 months.
          </p>
        </section>
        <section className="stack-section">
          <h2>You&apos;re a top customer</h2>
          {statList.map((s) => (
            <div key={s.label} style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
