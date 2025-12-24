import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyClaims, submitQualityCheck, fetchNotifications, markNotificationRead } from '../api/claims'
import { toast } from 'sonner'

export const NGODashboard = () => {
  const [claims, setClaims] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [mediaInputs, setMediaInputs] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchMyClaims()
      setClaims(data)
      const notes = await fetchNotifications()
      setNotifications(notes)
    } catch (err) {
      toast.error('Failed to load claims')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      toast.error('Failed to mark as read')
    }
  }

  const handleQualityCheck = async (claimId) => {
    const urls = (mediaInputs[claimId] || '').split(',').map((s) => s.trim()).filter(Boolean)
    try {
      await submitQualityCheck(claimId, urls)
      toast.success('Quality check submitted')
      setMediaInputs((m) => ({ ...m, [claimId]: '' }))
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit quality check')
    }
  }

  const stats = {
    total: claims.length,
    pending: claims.filter((c) => c.status === 'claimed').length,
    verified: claims.filter((c) => c.status === 'verified').length,
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>NGO Dashboard</h2>
        <Link className="btn ghost" to="/browse">Browse Listings</Link>
      </div>

      <div className="stats section">
        <div className="stat-card">
          <p className="muted">Total claims</p>
          <h3>{stats.total}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Pending</p>
          <h3>{stats.pending}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Verified</p>
          <h3>{stats.verified}</h3>
        </div>
      </div>

      <div className="section grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {loading && <p className="muted">Loading...</p>}
        {!loading && claims.length === 0 && <p className="muted">No claims yet.</p>}
        {!loading && claims.map((c) => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>{c.listing?.food_type || 'Listing'}</h4>
              <span className={`badge status-${c.status}`}>{c.status}</span>
            </div>
            <p className="muted">Provider: {c.listing?.provider_name}</p>
            <p className="muted">Pickup: {c.listing?.pickup_window_start ? new Date(c.listing.pickup_window_start).toLocaleString() : 'n/a'}</p>
            <div className="form-row" style={{ marginTop: 8 }}>
              <label className="label">Quality check media URLs (comma separated)</label>
              <input
                className="input"
                placeholder="https://..."
                value={mediaInputs[c.id] || ''}
                onChange={(e) => setMediaInputs((m) => ({ ...m, [c.id]: e.target.value }))}
              />
              <button
                className="btn"
                type="button"
                onClick={() => handleQualityCheck(c.id)}
                data-testid="upload-quality-check-button"
              >
                Submit quality check
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>Notifications</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {notifications.length === 0 && <p className="muted">No notifications.</p>}
          {notifications.map((n) => (
            <div key={n.id} className="card">
              <p>{n.message}</p>
              <p className="muted">{new Date(n.created_at).toLocaleString()}</p>
              {!n.read && (
                <button className="btn ghost" type="button" onClick={() => handleMarkRead(n.id)}>
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
