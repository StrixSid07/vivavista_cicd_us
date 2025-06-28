import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LeadProvider } from './contexts/LeadContext'; // <-- Import your context
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LeadProvider>
    <App />
    </LeadProvider>
  </StrictMode>,
)
