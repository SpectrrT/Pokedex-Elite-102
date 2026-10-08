import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { swrConfig } from './lib/swr.ts'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found in index.html')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <SWRConfig value={swrConfig}>
        <App />
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>,
)
