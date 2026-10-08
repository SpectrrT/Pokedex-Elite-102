import { render } from '@testing-library/react'
import { SWRConfig } from 'swr'
import App from '../App'
import { swrConfig } from '../lib/swr'

/** Render the app with a fresh SWR cache so tests cannot leak data into one another. */
export function renderApp() {
  return render(
    <SWRConfig
      value={{
        ...swrConfig,
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      <App />
    </SWRConfig>,
  )
}
