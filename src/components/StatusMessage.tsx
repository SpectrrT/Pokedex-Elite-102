import type { ReactNode } from 'react'

type StatusKind = 'loading' | 'info' | 'warning' | 'error'

interface StatusMessageProps {
  kind: StatusKind
  title?: string
  children: ReactNode
}

const ALERT_CLASS: Record<Exclude<StatusKind, 'loading'>, string> = {
  info: 'alert-secondary',
  warning: 'alert-warning',
  error: 'alert-danger',
}

/**
 * Loading, empty and error states. Only errors are live regions (`role="alert"`); routine
 * progress is announced through the persistent status region in PokemonDetails, so the visible
 * messages here stay plain markup and do not double up announcements.
 */
export function StatusMessage({ kind, title, children }: StatusMessageProps) {
  if (kind === 'loading') {
    return (
      <div className="d-flex align-items-center gap-2 text-body-secondary">
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        <span>{children}</span>
      </div>
    )
  }

  return (
    <div
      className={`alert ${ALERT_CLASS[kind]} mb-0`}
      role={kind === 'error' ? 'alert' : undefined}
    >
      {title && <h2 className="alert-heading h5">{title}</h2>}
      <p className="mb-0">{children}</p>
    </div>
  )
}
