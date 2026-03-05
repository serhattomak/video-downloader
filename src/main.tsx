import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler
window.onerror = (message, _source, _lineno, _colno, _error) => {
  console.error('Global error:', message)
}

window.onunhandledrejection = (event) => {
  console.error('Unhandled rejection:', event.reason)
}

console.log('React app starting...')

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('React app rendered')
} catch (e) {
  console.error('React render error:', e)
}
