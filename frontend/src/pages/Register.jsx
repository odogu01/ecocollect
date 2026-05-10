import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert, Select } from '../components/common'

// Port Harcourt locations
const PORTHARCOURT_LOCATIONS = [
  { value: '', label: 'Select your location' },
  { value: 'Ada-George', label: 'Ada-George' },
  { value: 'Aluu', label: 'Aluu' },
  { value: 'Amadi-Ama', label: 'Amadi-Ama' },
  { value: 'Bori', label: 'Bori' },
  { value: 'Choba', label: 'Choba' },
  { value: 'D-Line', label: 'D-Line' },
  { value: 'Dakata', label: 'Dakata' },
  { value: 'Elekahia', label: 'Elekahia' },
  { value: 'Elelenwo', label: 'Elelenwo' },
  { value: 'Eliopoly', label: 'Eliopoly' },
  { value: 'Elito', label: 'Elito' },
  { value: 'Eneka', label: 'Eneka' },
  { value: 'Iwofe', label: 'Iwofe' },
  { value: 'Kaa', label: 'Kaa' },
  { value: 'Ketu', label: 'Ketu' },
  { value: 'MGbada', label: 'MGbada' },
  { value: 'Milling Plant', label: 'Milling Plant' },
  { value: 'Nego', label: 'Nego' },
  { value: 'New GRA', label: 'New GRA' },
  { value: 'Nkpolu', label: 'Nkpolu' },
  { value: 'Obu-Obele', label: 'Obu-Obele' },
  { value: 'Ogbunike', label: 'Ogbunike' },
  { value: 'Oginigba', label: 'Oginigba' },
  { value: 'Oi', label: 'Oi' },
  { value: 'Okporowo', label: 'Okporowo' },
  { value: 'Omagwa', label: 'Omagwa' },
  { value: 'Omoku', label: 'Omoku' },
  { value: 'Orji', label: 'Orji' },
  { value: 'Oyigbo', label: 'Oyigbo' },
  { value: 'Pirri', label: 'Pirri' },
  { value: 'Rumuaghaolu', label: 'Rumuaghaolu' },
  { value: 'Rumuakpani', label: 'Rumuakpani' },
  { value: 'Rumuibekwe', label: 'Rumuibekwe' },
  { value: 'Rumuigbo', label: 'Rumuigbo' },
  { value: 'Rumuita', label: 'Rumuita' },
  { value: 'Rumuodumaya', label: 'Rumuodumaya' },
  { value: 'Rumuokwachi', label: 'Rumuokwachi' },
  { value: 'Rumuola', label: 'Rumuola' },
  { value: 'Rumuoside', label: 'Rumuoside' },
  { value: 'Rumu-pi', label: 'Rumu-pi' },
  { value: 'Rumu-ti', label: 'Rumu-ti' },
  { value: 'Sugar', label: 'Sugar' },
  { value: 'Tombia', label: 'Tombia' },
  { value: 'Trans-Amadi', label: 'Trans-Amadi' },
  { value: 'Woji', label: 'Woji' },
  { value: 'YKC', label: 'YKC' },
  { value: 'Other', label: 'Other' }
]

const Register = () => {
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: ''
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
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid'
    if (!formData.phone) errors.phone = 'Phone number is required'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.address) errors.address = 'Address is required'
    if (!formData.city) errors.city = 'Location is required'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city
      }
      await register(userData)
      // After registration, redirect to subscribe page
      navigate('/subscribe')
    } catch (err) {
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-3xl">♻️</span>
            </div>
            <span className="text-3xl font-bold text-gradient">EcoCollect</span>
          </Link>
          <p className="text-gray-500 mt-2">Create your account to start recycling</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up as Resident</h2>

          {error && (
            <Alert type="error" message={error} className="mb-6" onClose={clearError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={validationErrors.name}
              required
              icon="👤"
            />

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
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              error={validationErrors.phone}
              required
              icon="📱"
            />

            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, City"
              error={validationErrors.address}
              required
              icon="📍"
            />

            <Select
              label="Location (Port Harcourt)"
              name="city"
              value={formData.city}
              onChange={handleChange}
              options={PORTHARCOURT_LOCATIONS}
              error={validationErrors.city}
              required
              icon="🏙️"
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

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={validationErrors.confirmPassword}
              required
              icon="🔒"
            />

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" className="mt-1 rounded" required />
              <span>I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              </span>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register