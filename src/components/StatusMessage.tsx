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

/** Loading, empty and error states, announced to assistive technology via live regions. */
export function StatusMessage({ kind, title, children }: StatusMessageProps) {
  if (kind === 'loading') {
    return (
      <output className="d-flex align-items-center gap-2 text-body-secondary">
        <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        <span>{children}</span>
      </output>
    )
  }

  const className = `alert ${ALERT_CLASS[kind]} mb-0`
  const body = (
    <>
      {title && <h2 className="alert-heading h5">{title}</h2>}
      <p className="mb-0">{children}</p>
    </>
  )

  // <output> carries an implicit "status" role; errors must interrupt, so they stay role="alert".
  return kind === 'error' ? (
    <div className={className} role="alert">
      {body}
    </div>
  ) : (
    <output className={`${className} d-block`}>{body}</output>
  )
}
