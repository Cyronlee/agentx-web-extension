import React from 'react'
import ReactDOM from 'react-dom/client'
import { addCollection } from '@iconify/react'
import { icons as lucide } from '@iconify-json/lucide'
import App from './App.tsx'

// Initialize Iconify with Lucide icons
addCollection(lucide)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
