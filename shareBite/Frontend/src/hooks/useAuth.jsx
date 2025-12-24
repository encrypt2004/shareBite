import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, fetchMe } from '../api/auth'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sb_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('sb_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && !user) {
      fetchMe()
        .then((res) => {
          setUser(res.user)
          localStorage.setItem('sb_user', JSON.stringify(res.user))
        })
        .catch(() => {
          setToken(null)
          localStorage.removeItem('sb_token')
        })
    }
  }, [token, user])

  const persist = (accessToken, profile) => {
    setToken(accessToken)
    setUser(profile)
    localStorage.setItem('sb_token', accessToken)
    localStorage.setItem('sb_user', JSON.stringify(profile))
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginUser({ email, password })
      persist(data.access_token, data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      const data = await registerUser(payload)
      persist(data.access_token, data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('sb_token')
    localStorage.removeItem('sb_user')
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, setUser }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
