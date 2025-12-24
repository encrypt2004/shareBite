import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchListingById } from '../api/listings'
import { createClaim, fetchClaimsForListing } from '../api/claims'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export const ListingDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const roles = user?.roles || []
  const [listing, setListing] = useState(null)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchListingById(id)
      setListing(data)
      if (roles.includes('provider')) {
        const claimData = await fetchClaimsForListing(id)
        setClaims(claimData)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleClaim = async () => {
    setClaiming(true)
    try {
      await createClaim(id)
      toast.success('Claim submitted')
      await load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to claim')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>
  if (!listing) return <div className="page"><p className="muted">Listing not found.</p></div>

  return (
    <div className="page">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{listing.food_type}</h2>
          <span className={`badge status-${listing.status}`}>{listing.status}</span>
        </div>
        <p className="muted">Provider: {listing.provider_name}</p>
        <p className="muted">Phone: {listing.provider_phone}</p>
        <p>Quantity: {listing.quantity}</p>
        <p>Quality: {listing.quality}</p>
        <p>Location: {listing.location}</p>
        <p>Pickup window: {new Date(listing.pickup_window_start).toLocaleString()} - {new Date(listing.pickup_window_end).toLocaleString()}</p>
        <p>Description: {listing.description}</p>
        {roles.includes('ngo') && listing.status === 'available' && (
          <button className="btn" onClick={handleClaim} disabled={claiming} data-testid="claim-listing-button">
            {claiming ? 'Claiming...' : 'Claim this listing'}
          </button>
        )}
      </div>

      {roles.includes('provider') && (
        <div className="section">
          <h3>Claims</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {claims.length === 0 && <p className="muted">No claims yet.</p>}
            {claims.map((c) => (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{c.ngo_name}</span>
                  <span className={`badge status-${c.status}`}>{c.status}</span>
                </div>
                <p className="muted">Claimed: {new Date(c.claimed_at).toLocaleString()}</p>
                {c.quality_check_media?.length > 0 && (
                  <p>Media: {c.quality_check_media.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
