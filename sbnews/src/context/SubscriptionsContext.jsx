import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from './AuthContext.jsx'

const SubscriptionsContext = createContext()

// "Subscribing" here means following a news category/topic so it can be
// surfaced in Settings and (in future) used to power notifications —
// this is the concrete "Subscribe" user action the app tracks, separate
// from the newsletter email box in the footer.
const storageKey = (user) => `sbnews-subscriptions-${user?.email || 'guest'}`

export const SubscriptionsProvider = ({ children }) => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem(storageKey(user))
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(user))
    setSubscriptions(saved ? JSON.parse(saved) : [])
  }, [user?.email])

  const persist = (list) => {
    setSubscriptions(list)
    localStorage.setItem(storageKey(user), JSON.stringify(list))
  }

  const isSubscribed = (category) => subscriptions.includes(category)

  const toggleSubscription = (category) => {
    if (!category) return
    if (isSubscribed(category)) {
      persist(subscriptions.filter((c) => c !== category))
      toast.info(`Unsubscribed from ${category}.`)
    } else {
      persist([...subscriptions, category])
      toast.success(`Subscribed to ${category}.`)
    }
  }

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, isSubscribed, toggleSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export const useSubscriptions = () => useContext(SubscriptionsContext)
