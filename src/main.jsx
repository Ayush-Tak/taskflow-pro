import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Application Entry Point
 * Initializes the React application and renders it to the DOM
 * Wraps the app in StrictMode for development warnings and checks
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
