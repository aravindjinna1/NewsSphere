import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext.jsx'

const FavoritesContext = createContext()

// Favorites are namespaced per signed-in user (falling back to a shared
// "guest" bucket) so switching accounts on the same browser doesn't mix
// up saved articles. Persisted to localStorage, front-end only — same
// approach as AuthContext.
const storageKey = (user) => `sbnews-favorites-${user?.email || 'guest'}`

const articleId = (article) => article?.url || article?.title

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(storageKey(user))
    return saved ? JSON.parse(saved) : []
  })

  // Reload the relevant bucket whenever the signed-in user changes
  // (login, logout, or switching accounts).
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(user))
    setFavorites(saved ? JSON.parse(saved) : [])
  }, [user?.email])

  const persist = (list) => {
    setFavorites(list)
    localStorage.setItem(storageKey(user), JSON.stringify(list))
  }

  const isFavorite = (article) => favorites.some((a) => articleId(a) === articleId(article))

  const toggleFavorite = (article) => {
    if (!article) return
    if (isFavorite(article)) {
      persist(favorites.filter((a) => articleId(a) !== articleId(article)))
      toast.info('Removed from Favorites.')
    } else {
      persist([{ ...article, savedAt: new Date().toISOString() }, ...favorites])
      toast.success('Added to Favorites.')
    }
  }

  const removeFavorite = (article) => {
    persist(favorites.filter((a) => articleId(a) !== articleId(article)))
    toast.info('Removed from Favorites.')
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)

