export type VelocityDayPoint = {
  label: string
  midValley: number
  klSentral: number
  oneUtama: number
  penang: number
}

const SERIES: {
  key: keyof Pick<VelocityDayPoint, 'midValley' | 'klSentral' | 'oneUtama' | 'penang'>
  label: string
  className: string
}[] = [
  { key: 'midValley', label: 'Mid Valley', className: 'inv-v-line--mv' },
  { key: 'klSentral', label: 'KL Sentral', className: 'inv-v-line--ks' },
  { key: 'oneUtama', label: '1 Utama', className: 'inv-v-line--1u' },
  { key: 'penang', label: 'Penang', className: 'inv-v-line--pg' },
]

type Props = {
  /** One point per calendar day — daily units sold (total catalogue) by outlet. */
  data: VelocityDayPoint[]
}

export function OutletVelocityLineChart({ data }: Props) {
  const n = data.length
  const W = 1600
  const H = 260
  const pl = 52
  const pr = 24
  const pt = 22
  const pb = 44
  const iw = W - pl - pr
  const ih = H - pt - pb

  const maxVal = Math.max(
    8,
    ...data.flatMap((d) => [d.midValley, d.klSentral, d.oneUtama, d.penang]),
  )
  const yMax = Math.max(40, Math.ceil(maxVal / 25) * 25)

  const xAt = (i: number) => {
    if (n <= 1) return pl + iw / 2
    return pl + (i / (n - 1)) * iw
  }

  const yAt = (v: number) => pt + ih - (v / yMax) * ih

  const gridTicks = 5
  const gridLines = Array.from({ length: gridTicks + 1 }, (_, g) => {
    const frac = g / gridTicks
    const v = Math.round(yMax * (1 - frac))
    const y = pt + ih * frac
    return { id: `g-${g}-${v}`, v, y }
  })

  const xAxisEvery = Math.max(1, Math.ceil(n / 14))

  return (
    <div
      className="inv-velocity-line-chart"
      role="img"
      aria-label={`Daily units sold by outlet — ${n} calendar days`}
    >
      <div className="inv-velocity-legend">
        {SERIES.map((s) => (
          <span key={s.key} className={`inv-velocity-legend-item ${s.className}`}>
            {s.label}
          </span>
        ))}
        <span className="inv-velocity-scale-hint">
          Daily units · {n} days · Y 0–{yMax.toLocaleString()}
        </span>
      </div>

      <div className="inv-velocity-svg-wrap">
        <svg
          className="inv-velocity-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          width="100%"
        >
          {gridLines.map(({ id, v, y }) => (
            <g key={id}>
              <line
                x1={pl}
                y1={y}
                x2={W - pr}
                y2={y}
                className="inv-velocity-grid-line"
              />
              <text x={pl - 10} y={y + 4} textAnchor="end" className="inv-velocity-axis-y">
                {v}
              </text>
            </g>
          ))}

          {SERIES.map((s) => {
            const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d[s.key]) }))
            const lineD = pts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ')
            return (
              <path
                key={s.key}
                d={lineD}
                className={`inv-v-path ${s.className}`}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}

          {data.map((d, i) =>
            i % xAxisEvery === 0 || i === n - 1 ? (
              <text
                key={`${d.label}-${i}`}
                x={xAt(i)}
                y={H - 10}
                textAnchor="middle"
                className="inv-velocity-axis-x"
              >
                {d.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  )
}
