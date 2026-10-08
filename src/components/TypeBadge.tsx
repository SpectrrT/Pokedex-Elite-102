import { humanize } from '../lib/format'

interface TypeBadgeProps {
  type: string
  /** Optional suffix such as a damage multiplier ("4×"). */
  detail?: string
}

export function TypeBadge({ type, detail }: TypeBadgeProps) {
  return (
    <span className={`type-badge type-${type}`}>
      {humanize(type)}
      {detail && <span className="type-badge__detail">{detail}</span>}
    </span>
  )
}
