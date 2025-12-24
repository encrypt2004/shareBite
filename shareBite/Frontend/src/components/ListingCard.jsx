import { Link } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'
import { cn } from '../lib/utils'

export const ListingCard = ({ listing }) => {
  const statusClass = cn('badge', `status-${listing.status}`)
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{listing.food_type}</h3>
        <span className={statusClass}>{listing.status}</span>
      </div>
      <p className="muted">Quantity: {listing.quantity}</p>
      <p className="muted">Pickup: {new Date(listing.pickup_window_start).toLocaleString()} - {new Date(listing.pickup_window_end).toLocaleString()}</p>
      <p>{listing.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BadgeCheck size={16} /> {listing.provider_name}
        </span>
        <Link className="btn ghost" to={`/listings/${listing.id}`}>
          Details
        </Link>
      </div>
    </div>
  )
}
