import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles/tokens.css'
import './styles/app.css'
import { ColmenaProvider } from './lib/store'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColmenaProvider>
      <App />
    </ColmenaProvider>
  </React.StrictMode>
)
