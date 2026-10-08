import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initMonitoring } from './monitoring'

initMonitoring();

// index.html carries fallback meta tags for link-preview bots that don't run JS.
// Each page sets its own, so drop the fallbacks to avoid duplicates.
document.querySelectorAll('[data-static-seo]').forEach((el) => el.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
