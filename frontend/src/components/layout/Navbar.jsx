import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { getInitials, getRoleLabel } from '../../utils/helpers'

const Navbar = () => {
  const { user, logout, isAdmin, isCompany, isDriver, isResident } = useAuth()
  const { notifications, connected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', roles: ['admin', 'company', 'driver', 'resident'] },
    { path: '/request-pickup', label: 'Request Pickup', roles: ['resident', 'company'] },
    { path: '/my-pickups', label: 'My Pickups', roles: ['resident', 'company'] },
    { path: '/track-pickup', label: 'Track Pickup', roles: ['resident', 'company'] },
    { path: '/subscribe', label: 'Subscribe', roles: ['resident'], showIfNoSubscription: true },
    { path: '/assignments', label: 'Assignments', roles: ['driver'] },
    { path: '/deliveries', label: 'Deliveries', roles: ['driver'] },
    { path: '/manage-pickups', label: 'Pickups', roles: ['company', 'admin'] },
    { path: '/pricing', label: 'Pricing', roles: ['company', 'admin'] },
    { path: '/users', label: 'Users', roles: ['admin'] },
  ]

  const getVisibleLinks = () => {
    return navLinks.filter(link => {
      // Check if user has role access
      if (!link.roles.includes(user?.role)) return false

      // For subscription link, only show if user doesn't have active subscription
      if (link.showIfNoSubscription) {
        return !user?.hasActiveSubscription
      }

      return true
    })
  }

  return (
    <nav className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white text-xl">♻️</span>
            </div>
            <span className="text-xl font-bold text-gradient">EcoCollect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {getVisibleLinks().map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500">{connected ? 'Live' : 'Offline'}</span>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="relative">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>👤</span> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-2">
              {getVisibleLinks().map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg ${location.pathname === link.path ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar