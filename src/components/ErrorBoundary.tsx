import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StatusMessage } from './StatusMessage'

interface ErrorBoundaryProps {
  children: ReactNode
  /** When this changes, a caught error is cleared and the children render again. */
  resetKey?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  resetKey: string | undefined
}

/**
 * Stops a rendering crash from blanking the whole page. React still has no hook equivalent, so
 * this is the one class component in the app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    return props.resetKey === state.resetKey ? null : { hasError: false, resetKey: props.resetKey }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('The Pokédex crashed while rendering.', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <StatusMessage kind="error" title="Something went wrong">
          This page couldn't be displayed. Try another search or reload.
        </StatusMessage>
      )
    }
    return this.props.children
  }
}
