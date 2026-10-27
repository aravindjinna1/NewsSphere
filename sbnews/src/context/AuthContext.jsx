import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword
} from 'firebase/auth'
import { toast } from 'react-toastify'
import { validatePassword } from '../utils/passwordValidation.js'
import { auth, googleProvider } from '../firebase.js'


const AuthContext = createContext(null)
const profileKey = (uid) => `sbnews-profile-${uid}`
const usernameFrom = (name, email) => (name || email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'user'
const getProfileExtras = (uid) => {
  try { return JSON.parse(localStorage.getItem(profileKey(uid)) || '{}') } catch { return {} }
}

const toUser = (firebaseUser) => {
  if (!firebaseUser) return null
  const extras = getProfileExtras(firebaseUser.uid)
  const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
  
  return {
    uid: firebaseUser.uid,
    name,
    email: firebaseUser.email,
    country: extras.country || 'us',
    avatar: name[0]?.toUpperCase() || 'U',
    username: extras.username || usernameFrom(name, firebaseUser.email),
    photo: extras.photo ?? firebaseUser.photoURL ?? null,
    joinedAt: firebaseUser.metadata.creationTime || null,
    provider: firebaseUser.providerData.some((item) => item.providerId === 'google.com') ? 'google' : 'password'
  }
}

const readableAuthError = (error) => {
  const messages = {
    'auth/email-already-in-use': 'An account with that email already exists. Try signing in.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account was found for that email.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/weak-password': 'Choose a stronger password.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow popups and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Sign in using its original method.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
    'auth/unauthorized-domain': 'Add this site’s domain to Firebase Authentication authorized domains.'
  }
  return messages[error?.code] || error?.message || 'Authentication failed. Please try again.'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, (firebaseUser) => {
    setUser(toUser(firebaseUser))
    setAuthLoading(false)
  }), [])

  const runAuth = async (action, successMessage) => {
    try {
      const result = await action()
      if (successMessage) toast.success(successMessage)
      return result
    } catch (error) {
      toast.error(readableAuthError(error))
      return null
    }
  }

  const signup = async ({ name, email, password, country }) => {
    const passwordError = validatePassword(password)
    if (passwordError) { toast.error(passwordError); return false }
    const credential = await runAuth(() => createUserWithEmailAndPassword(auth, email.trim(), password))
    if (!credential) return false
    try {
      await updateFirebaseProfile(credential.user, { displayName: name.trim() })
      localStorage.setItem(profileKey(credential.user.uid), JSON.stringify({ country: country || 'us' }))
      setUser(toUser(credential.user))
    } catch (error) {
      toast.error(readableAuthError(error))
      return false
    }
    toast.success('Account created successfully!')
    return true
  }

  const login = async ({ email, password }) => {
    const credential = await runAuth(() => signInWithEmailAndPassword(auth, email.trim(), password), 'Welcome back!')
    return !!credential
  }

  const loginWithGoogle = async () => {
    const credential = await runAuth(() => signInWithPopup(auth, googleProvider), 'Signed in with Google!')
    return !!credential
  }

  const logout = async () => {
    await runAuth(() => signOut(auth), 'Logged out successfully.')
  }

  const updateProfile = async (updates) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return false
    try {
      await updateFirebaseProfile(firebaseUser, { displayName: updates.name })
      const extras = { ...getProfileExtras(firebaseUser.uid), username: updates.username, photo: updates.photo }
      localStorage.setItem(profileKey(firebaseUser.uid), JSON.stringify(extras))
      setUser(toUser(firebaseUser))
      toast.success('Profile updated successfully.')
      return true
    } catch (error) {
      toast.error(readableAuthError(error))
      return false
    }
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    const passwordError = validatePassword(newPassword)
    if (passwordError) { toast.error(passwordError); return false }
    const firebaseUser = auth.currentUser
    if (!firebaseUser?.email || !firebaseUser.providerData.some((item) => item.providerId === 'password')) {
      toast.error('This account does not use an email and password sign-in.')
      return false
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)
      await updateFirebasePassword(firebaseUser, newPassword)
      toast.success('Password updated successfully.')
      return true
    } catch (error) {
      toast.error(error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' ? 'Current password is incorrect.' : readableAuthError(error))
      return false
    }
  }

  
  return (
    <AuthContext.Provider value={{ user, authLoading, signup, login, loginWithGoogle, logout, updateProfile, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
