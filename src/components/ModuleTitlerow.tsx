import type { ReactNode } from 'react'

export type ModuleTitlerowProps = {
  lead: string
  meta?: ReactNode
  /** 'split' matches POS catalog (title left, meta right). 'center' for AI BI–style heroes. */
  align?: 'split' | 'center'
  className?: string
}

export function ModuleTitlerow({ lead, meta, align = 'split', className = '' }: ModuleTitlerowProps) {
  const leadText = lead.replace(/\.$/, '').trim()
  const alignClass = align === 'center' ? ' module-titlerow--center' : ''
  const extra = className ? ` ${className}` : ''

  return (
    <div className={`module-titlerow reveal${alignClass}${extra}`.trim()}>
      <h1>{leadText}</h1>
      {meta != null ? <div className="meta">{meta}</div> : null}
    </div>
  )
}
