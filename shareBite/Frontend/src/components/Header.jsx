import { Link, useLocation } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

const NavLink = ({ to, label, testId }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link to={to} className={cn('pill', active && 'btn ghost')} data-testid={testId}>
      {label}
    </Link>
  )
}

export const Header = () => {
  const { user, logout } = useAuth()
  const roles = user?.roles || []

  return (
    <header className="header-blur">
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
          <UtensilsCrossed color="hsl(var(--primary))" size={28} />
          <span>ShareBite</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/browse" label="Browse" />
          {roles.includes('provider') && (
            <NavLink to="/provider" label="Provider" testId="provider-dashboard-nav" />
          )}
          {roles.includes('ngo') && (
            <NavLink to="/ngo" label="NGO" testId="ngo-dashboard-nav" />
          )}
          {!user && <NavLink to="/login" label="Login" />}
          {!user && <NavLink to="/register" label="Register" />}
          {user && (
            <button className="btn ghost" onClick={logout} data-testid="logout-button">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
