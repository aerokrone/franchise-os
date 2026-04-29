import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { ModuleTitlerow } from '../components/ModuleTitlerow'
import { useBookingData } from '../context/BookingDataContext'
import type { FranchiseService, ServiceCategory } from '../data/booking-mock'

const CATS: ServiceCategory[] = ['Repair', 'Setup', 'Trade-in', 'Protection', 'Diagnostics']

function uid() {
  return `svc-${Math.random().toString(36).slice(2, 9)}`
}

export function HqServicesPage() {
  const { services, upsertService, removeService } = useBookingData()
  const [editing, setEditing] = useState<FranchiseService | null>(null)
  const [creating, setCreating] = useState(false)

  const openEdit = (s: FranchiseService) => {
    setEditing({ ...s })
    setCreating(false)
  }

  const openCreate = () => {
    const next: FranchiseService = {
      id: uid(),
      sku: `SRV-X${Math.floor(Math.random() * 900 + 100)}`,
      name: '',
      description: '',
      durationMin: 30,
      category: 'Diagnostics',
      price: 49,
      image:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=440&fit=crop',
      active: true,
    }
    setEditing(next)
    setCreating(true)
  }

  const save = () => {
    if (!editing?.name.trim()) return
    upsertService(editing, creating ? undefined : editing.id)
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="stack-page">
      <ModuleTitlerow
        lead="Services"
        meta={
          <>
            HQ catalogue · <b>{services.filter((s) => s.active).length}</b> active
          </>
        }
      />
      <div className="booking-admin-toolbar">
        <p className="muted">Create, price, and deactivate services for the whole franchise.</p>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2.5} className="booking-btn-ico" />
          Add service
        </button>
      </div>

      <table className="booking-matrix hq-services-table">
        <thead>
          <tr>
            <th className="left">SKU</th>
            <th className="left">Service</th>
            <th className="c">Category</th>
            <th className="c">Dur.</th>
            <th className="c">RM</th>
            <th className="c">Status</th>
            <th className="c">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td className="booking-mono">{s.sku}</td>
              <td className="booking-cell-name">{s.name}</td>
              <td className="c">{s.category}</td>
              <td className="c">{s.durationMin}m</td>
              <td className="c booking-mono">{s.price.toFixed(2)}</td>
              <td className="c">
                <span className={`booking-status ${s.active ? 'booking-status--confirmed' : 'booking-status--cancelled'}`}>
                  {s.active ? 'Active' : 'Off'}
                </span>
              </td>
              <td className="c">
                <button type="button" className="booking-dot-btn" onClick={() => openEdit(s)}>
                  <Pencil width={12} strokeWidth={2} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing ? (
        <div className="booking-modal-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="booking-modal-overlay__backdrop"
            aria-label="Close"
            onClick={() => setEditing(null)}
          />
          <article className="booking-modal-sheet booking-modal-sheet--dialog hq-service-editor">
            <header className="booking-modal-sheet__top booking-modal-sheet__head">
              <div>
                <h2 className="booking-modal-sheet__title">{creating ? 'Create service' : 'Edit service'}</h2>
                <p className="muted" style={{ marginTop: 6 }}>
                  Pricing and description appear in customer Booking and POS services.
                </p>
              </div>
              <button
                type="button"
                className="booking-icon-toggle"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="booking-modal-sheet__body">
              <label className="booking-field">
              Name
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. OLED panel replacement quote"
              />
              </label>
              <label className="booking-field">
              SKU
              <input
                value={editing.sku}
                onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
              />
              </label>
              <label className="booking-field">
              Description
              <textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <label className="booking-field">
                Category
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as ServiceCategory,
                    })
                  }
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="booking-field">
                Minutes
                <input
                  type="number"
                  min={10}
                  step={5}
                  value={editing.durationMin}
                  onChange={(e) =>
                    setEditing({ ...editing, durationMin: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="booking-field">
                Price RM
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                />
              </label>
              </div>
              {!creating ? (
              <label className="booking-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Active in catalogue
              </label>
              ) : null}
              {!creating && !editing.active ? (
              <button
                type="button"
                className="btn btn-ghost booking-block-btn"
                onClick={() => {
                  removeService(editing.id)
                  setEditing(null)
                }}
              >
                Deactivate (soft off)
              </button>
              ) : null}
            </div>
            <footer className="booking-modal-sheet__foot">
              <button type="button" className="btn btn-primary booking-block-btn" onClick={save}>
                Save changes
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </div>
  )
}
