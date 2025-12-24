import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export const Login = () => {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      toast.success('Logged in')
      if (from) return navigate(from, { replace: true })
      if (user.roles?.includes('provider')) return navigate('/provider')
      if (user.roles?.includes('ngo')) return navigate('/ngo')
      return navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="page" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
      <div className="card" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1730342582682-1447653f62b8?crop=entropy&cs=srgb&fm=jpg&q=85)', backgroundSize: 'cover', minHeight: 320 }}></div>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="login-email-input"
            />
          </div>
          <div className="form-row">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password-input"
            />
          </div>
          <button className="btn" type="submit" disabled={loading} data-testid="login-submit-button">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
