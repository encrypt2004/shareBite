import { Link } from 'react-router-dom'
import { Users, Heart, UtensilsCrossed } from 'lucide-react'

const heroImg = 'https://images.unsplash.com/photo-1750943082012-efe6d2fd9e45?crop=entropy&cs=srgb&fm=jpg&q=85'

export const Home = () => {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p className="pill" style={{ alignSelf: 'flex-start' }}>Reduce waste. Feed more.</p>
            <h1>Share surplus food with NGOs, fast.</h1>
            <p className="muted">
              ShareBite connects restaurants, hotels, and banquets with NGOs to redirect surplus food to communities that need it.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn" to="/register">Get Started</Link>
              <Link className="btn ghost" to="/browse">Browse Listings</Link>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
              <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UtensilsCrossed size={18} /> Providers
              </div>
              <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} /> NGOs
              </div>
              <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={18} /> Communities
              </div>
            </div>
          </div>
          <img src={heroImg} alt="Chef presenting fresh food with warm lighting" />
        </div>
      </section>
    </div>
  )
}
