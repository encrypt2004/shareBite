import { useEffect, useState } from 'react'
import { fetchListings } from '../api/listings'
import { ListingCard } from '../components/ListingCard'

export const Browse = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ search: '', location: '', status: 'available' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchListings({ status: filters.status })
      const filtered = data.filter((item) => {
        const matchFood = item.food_type.toLowerCase().includes(filters.search.toLowerCase())
        const matchLocation = item.location.toLowerCase().includes(filters.location.toLowerCase())
        return matchFood && matchLocation
      })
      setListings(filtered)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status])

  return (
    <div className="page">
      <h2>Browse Listings</h2>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="two-col">
          <div className="form-row">
            <label className="label">Search food type</label>
            <input
              className="input"
              placeholder="e.g., sandwiches"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label className="label">Location</label>
            <input
              className="input"
              placeholder="city or area"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn" onClick={load}>Search</button>
          <button className="btn ghost" onClick={() => setFilters({ search: '', location: '', status: 'available' })}>Reset</button>
        </div>
      </div>

      <div className="section grid" style={{ marginTop: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {loading && <p className="muted">Loading...</p>}
        {!loading && listings.length === 0 && <p className="muted">No listings found.</p>}
        {!loading && listings.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  )
}
