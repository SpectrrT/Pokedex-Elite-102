import type { SWRConfiguration } from 'swr'
import { NotFoundError } from './api'

/**
 * PokéAPI data is effectively static, so cache aggressively and skip background revalidation.
 * A definitive "not found" is never retried; transient failures are retried a couple of times.
 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 60_000,
  errorRetryCount: 2,
  shouldRetryOnError: (error: unknown) => !(error instanceof NotFoundError),
}
