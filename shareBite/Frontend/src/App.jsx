import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Browse } from './pages/Browse'
import { ListingDetails } from './pages/ListingDetails'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { RestaurantDashboard } from './pages/RestaurantDashboard'
import { NGODashboard } from './pages/NGODashboard'
import { useAuth } from './hooks/useAuth'

const PrivateRoute = ({ children, allowed }) => {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (allowed && !allowed.some((r) => user.roles?.includes(r))) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <div className="layout-shell">
      <Header />
      <main className="page" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/provider"
            element={
              <PrivateRoute allowed={["provider"]}>
                <RestaurantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/ngo"
            element={
              <PrivateRoute allowed={["ngo"]}>
                <NGODashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster richColors />
    </div>
  )
}

export default App
