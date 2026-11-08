import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AcademicProvider } from './context/AcademicContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AcademicProvider>
          <App />
        </AcademicProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
