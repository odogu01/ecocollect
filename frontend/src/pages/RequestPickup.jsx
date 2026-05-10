import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { pickupAPI } from '../services/api'
import { formatCurrency } from '../utils/helpers'
import { Input, Button, Card, CardTitle, Alert, LoadingSpinner } from '../components/common'
import Navbar from '../components/layout/Navbar'

const RequestPickup = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    scheduledDate: '',
    address: user?.address || '',
    notes: ''
  })
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {}

    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Please select a date'
    } else {
      const selectedDate = new Date(formData.scheduledDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.scheduledDate = 'Date must be in the future'
      }
    }

    if (!formData.address.trim()) errors.address = 'Address is required'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setError('')

    try {
      const pickupData = {
        scheduledDate: formData.scheduledDate,
        address: formData.address,
        notes: formData.notes
      }

      await pickupAPI.create(pickupData)

      navigate('/my-pickups', {
        state: { success: 'Pickup request submitted successfully!' }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create pickup request')
    } finally {
      setSubmitting(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Request a Pickup</h1>
          <p className="text-gray-600 mt-2">Schedule your waste collection in just a few steps</p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />
        )}

        <form onSubmit={handleSubmit}>
          <Card padding="lg">
            <CardTitle className="mb-6">Pickup Details</CardTitle>

            {/* Date & Time */}
            <div className="mb-6">
              <Input
                label="Preferred Date"
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={getMinDate()}
                error={validationErrors.scheduledDate}
                required
                icon="📅"
              />
            </div>

            {/* Address */}
            <div className="mb-6">
              <Input
                label="Pickup Address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, City"
                error={validationErrors.address}
                required
                icon="📍"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions for the driver..."
                rows={3}
                className="
                  w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                  transition-all duration-200 placeholder-gray-400 resize-none
                "
              />
            </div>

            {/* Subscription Info */}
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-primary-800">Included in Your Subscription</p>
                  <p className="text-sm text-primary-600">
                    Your pickup is covered by your monthly subscription
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              icon="🚚"
            >
              Schedule Pickup
            </Button>
          </Card>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Tips for faster service</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Ensure easy access to your pickup location</li>
                <li>• Be ready at the scheduled time</li>
                <li>• If your trash can is full, click "Report Full Trash Can" on your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RequestPickup