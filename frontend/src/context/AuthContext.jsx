import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await api.get('/auth/me')
      const userData = response.data.user

      // Check subscription status for residents
      if (userData.role === 'resident') {
        try {
          const subResponse = await api.get('/subscriptions/verify')
          userData.hasActiveSubscription = subResponse.data.hasActiveSubscription
          if (subResponse.data.subscription) {
            userData.subscriptionEndDate = subResponse.data.subscription.endDate
            userData.trashCansAssigned = subResponse.data.subscription.trashCansAssigned
          }
        } catch (subErr) {
          // If subscription check fails, assume no subscription
          userData.hasActiveSubscription = false
        }
      }

      setUser(userData)
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
      return userData
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      setError(message)
      throw new Error(message)
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post('/auth/register', userData)
      const { token, user: newUser } = response.data
      
      localStorage.setItem('token', token)
      setUser(newUser)
      return newUser
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const clearError = () => setError(null)

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCompany: user?.role === 'company',
    isDriver: user?.role === 'driver',
    isResident: user?.role === 'resident',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext