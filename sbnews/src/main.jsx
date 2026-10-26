import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NewsProvider } from './context/NewsContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { SubscriptionsProvider } from './context/SubscriptionsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SettingsProvider>
              <SubscriptionsProvider>
                <NewsProvider>
                  <App />
                </NewsProvider>
              </SubscriptionsProvider>
            </SettingsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
