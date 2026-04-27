import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingGHP from './pages/LandingGHP'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LandingGHP />
  </StrictMode>,
)
