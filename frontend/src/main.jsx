import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from "@sentry/react"
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

Sentry.init({ 
  dsn: import.meta.env.VITE_SENTRY_DSN, 
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()], 
  tracesSampleRate: 1.0 
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
