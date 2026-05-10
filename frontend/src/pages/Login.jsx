import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscriptionAPI } from '../services/api'
import { Input, Button, Alert } from '../components/common'

const Login = () => {
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    clearError()
  }

  const validate = () => {
    const errors = {}
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(formData.email, formData.password)
      // After login, go to dashboard - AuthContext will load subscription status
      // ProtectedRoute will handle redirect to subscribe if needed
      navigate('/dashboard')
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-3xl">♻️</span>
            </div>
            <span className="text-3xl font-bold text-gradient">EcoCollect</span>
          </Link>
          <p className="text-gray-500 mt-2">Welcome back! Please login to continue.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>

          {error && (
            <Alert type="error" message={error} className="mb-6" onClose={clearError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={validationErrors.email}
              required
              icon="📧"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={validationErrors.password}
              required
              icon="🔒"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
          <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Admin: admin@ecocollect.com / admin123</p>
            <p>Company: company@ecocollect.com / company123</p>
            <p>Driver: driver@ecocollect.com / driver123</p>
            <p>Resident: user@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login