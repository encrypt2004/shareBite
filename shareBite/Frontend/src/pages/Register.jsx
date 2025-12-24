import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export const Register = () => {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roles: [],
  })

  const toggleRole = (role) => {
    setForm((f) => {
      const exists = f.roles.includes(role)
      return { ...f, roles: exists ? f.roles.filter((r) => r !== role) : [...f.roles, role] }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.roles.length === 0) {
      toast.error('Select at least one role')
      return
    }
    try {
      const user = await register(form)
      toast.success('Registered')
      if (user.roles?.includes('provider')) return navigate('/provider')
      if (user.roles?.includes('ngo')) return navigate('/ngo')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="page" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
      <div className="card" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1678831654314-8d68bb47cb0f?crop=entropy&cs=srgb&fm=jpg&q=85)', backgroundSize: 'cover', minHeight: 320 }}></div>
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <label className="label" htmlFor="name">Name</label>
            <input
              className="input"
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              data-testid="register-name-input"
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="email">Email</label>
            <input
              className="input"
              type="email"
              id="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              data-testid="register-email-input"
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="password">Password</label>
            <input
              className="input"
              type="password"
              id="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="phone">Phone</label>
            <input
              className="input"
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="address">Address</label>
            <input
              className="input"
              id="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label className="label">Roles (choose at least one)</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label className="pill" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.roles.includes('provider')}
                  onChange={() => toggleRole('provider')}
                  data-testid="register-role-provider"
                  style={{ marginRight: 6 }}
                />
                Provider
              </label>
              <label className="pill" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.roles.includes('ngo')}
                  onChange={() => toggleRole('ngo')}
                  data-testid="register-role-ngo"
                  style={{ marginRight: 6 }}
                />
                NGO
              </label>
            </div>
          </div>
          <button className="btn" type="submit" disabled={loading} data-testid="register-submit-button">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
