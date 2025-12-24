import { useEffect, useState } from 'react'
import { createListing, fetchMyListings } from '../api/listings'
import { fetchNotifications, markNotificationRead } from '../api/claims'
import { toast } from 'sonner'

export const RestaurantDashboard = () => {
  const [listings, setListings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState({
    food_type: '',
    quantity: '',
    quality: '',
    pickup_window_start: '',
    pickup_window_end: '',
    location: '',
    description: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchMyListings()
      setListings(data)
      const notes = await fetchNotifications()
      setNotifications(notes)
    } catch (err) {
      toast.error('Failed to load dashboard')
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

  const create = async (e) => {
    e.preventDefault()
    try {
      await createListing(form)
      toast.success('Listing created')
      setShowForm(false)
      setForm({ food_type: '', quantity: '', quality: '', pickup_window_start: '', pickup_window_end: '', location: '', description: '' })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create listing')
    }
  }

  const stats = {
    total: listings.length,
    available: listings.filter((l) => l.status === 'available').length,
    completed: listings.filter((l) => l.status === 'completed').length,
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Provider Dashboard</h2>
        <button className="btn" onClick={() => setShowForm((v) => !v)} data-testid="create-listing-button">
          {showForm ? 'Close' : 'Create Listing'}
        </button>
      </div>

      <div className="stats section">
        <div className="stat-card">
          <p className="muted">Total</p>
          <h3>{stats.total}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Available</p>
          <h3>{stats.available}</h3>
        </div>
        <div className="stat-card">
          <p className="muted">Completed</p>
          <h3>{stats.completed}</h3>
        </div>
      </div>

      {showForm && (
        <div className="card section">
          <h3>New Listing</h3>
          <form onSubmit={create} className="two-col">
            <div className="form-row">
              <label className="label">Food type</label>
              <input
                className="input"
                required
                value={form.food_type}
                onChange={(e) => setForm((f) => ({ ...f, food_type: e.target.value }))}
                data-testid="listing-food-type-input"
              />
            </div>
            <div className="form-row">
              <label className="label">Quantity</label>
              <input
                className="input"
                required
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <label className="label">Quality</label>
              <input
                className="input"
                value={form.quality}
                onChange={(e) => setForm((f) => ({ ...f, quality: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <label className="label">Pickup start</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={form.pickup_window_start}
                onChange={(e) => setForm((f) => ({ ...f, pickup_window_start: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <label className="label">Pickup end</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={form.pickup_window_end}
                onChange={(e) => setForm((f) => ({ ...f, pickup_window_end: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <label className="label">Location</label>
              <input
                className="input"
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <button className="btn" type="submit" data-testid="listing-submit-button">
              Save Listing
            </button>
          </form>
        </div>
      )}

      <div className="section grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {loading && <p className="muted">Loading...</p>}
        {!loading && listings.length === 0 && <p className="muted">No listings yet.</p>}
        {!loading && listings.map((l) => (
          <div key={l.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>{l.food_type}</h4>
              <span className={`badge status-${l.status}`}>{l.status}</span>
            </div>
            <p className="muted">{l.quantity}</p>
            <p className="muted">{l.location}</p>
            <p className="muted">Pickup: {new Date(l.pickup_window_start).toLocaleString()}</p>
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
                <button className="btn ghost" type="button" onClick={() => handleMarkRead(n.id)} data-testid="mark-read-button">
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
