import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext.jsx'

const SettingsContext = createContext()

const DEFAULTS = {
  breakingNews: true,
  dailyDigest: false,
  preferredCategory: 'general'
}

// Namespaced per signed-in user, same pattern as Auth/Favorites, so
// switching accounts doesn't leak preferences between users.
const storageKey = (user) => `sbnews-settings-${user?.email || 'guest'}`

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(storageKey(user))
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
  })

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(user))
    setSettings(saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS)
  }, [user?.email])

  const updateSettings = (updates) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updates }
      localStorage.setItem(storageKey(user), JSON.stringify(merged))
      return merged
    })
    toast.success('Settings saved.')
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
