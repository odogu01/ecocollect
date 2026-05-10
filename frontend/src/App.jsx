import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RequestPickup from './pages/RequestPickup'
import MyPickups from './pages/MyPickups'
import TrackPickup from './pages/TrackPickup'
import Payment from './pages/Payment'
import ManagePickups from './pages/ManagePickups'
import DriverAssignments from './pages/DriverAssignments'
import Profile from './pages/Profile'
import AdminUsers from './pages/AdminUsers'
import Subscribe from './pages/Subscribe'
import PricingManagement from './pages/PricingManagement'
import DriverDeliveries from './pages/DriverDeliveries'

// Components
import Layout from './components/layout/Layout'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, requireSubscription = false }) => {
  const { user, loading, isAuthenticated, isResident } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // For residents, check if they need to subscribe first
  if (requireSubscription && isResident && !user?.hasActiveSubscription) {
    return <Navigate to="/subscribe" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  const { isAdmin, isCompany, isDriver, isResident } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Subscription - Protected but without subscription check */}
      <Route
        path="/subscribe"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <Subscribe />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        {/* Dashboard - All roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Resident Routes - Require Subscription */}
        <Route
          path="/request-pickup"
          element={
            <ProtectedRoute allowedRoles={['resident', 'company']} requireSubscription>
              <RequestPickup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-pickups"
          element={
            <ProtectedRoute allowedRoles={['resident', 'company']} requireSubscription>
              <MyPickups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-pickup"
          element={
            <ProtectedRoute allowedRoles={['resident', 'company']} requireSubscription>
              <TrackPickup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-pickup/:id"
          element={
            <ProtectedRoute allowedRoles={['resident', 'company']} requireSubscription>
              <TrackPickup />
            </ProtectedRoute>
          }
        />

        {/* Payment Route */}
        <Route
          path="/payment/:id"
          element={
            <ProtectedRoute allowedRoles={['resident']}>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Company Routes */}
        <Route
          path="/manage-pickups"
          element={
            <ProtectedRoute allowedRoles={['company', 'admin']}>
              <ManagePickups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute allowedRoles={['company', 'admin']}>
              <PricingManagement />
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliveries"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDeliveries />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Profile - All authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <a href="/" className="text-primary-600 hover:underline">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}

export default App