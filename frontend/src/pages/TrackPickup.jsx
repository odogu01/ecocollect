import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pickupAPI } from '../services/api'
import { LoadingSpinner, Card, CardTitle, Button, Badge } from '../components/common'
import Navbar from '../components/layout/Navbar'
import { formatDate, getStatusColor, getStatusLabel, formatCurrency } from '../utils/helpers'

const TrackPickup = () => {
  const { id } = useParams()
  const [pickup, setPickup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchPickup()
    }
  }, [id])

  const fetchPickup = async () => {
    try {
      const response = await pickupAPI.getById(id)
      setPickup(response.data.pickup)
    } catch (err) {
      setError('Failed to load pickup details')
    } finally {
      setLoading(false)
    }
  }

  const statusSteps = [
    { key: 'pending', label: 'Request Submitted', icon: '📝' },
    { key: 'assigned', label: 'Driver Assigned', icon: '👤' },
    { key: 'picked', label: 'Picked Up', icon: '🚚' },
    { key: 'completed', label: 'Completed', icon: '✅' }
  ]

  const getCurrentStep = (status) => {
    const statusOrder = ['pending', 'assigned', 'picked', 'completed']
    return statusOrder.indexOf(status)
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading pickup details..." />
  }

  if (error || !pickup) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Pickup not found'}</p>
            <Link to="/my-pickups">
              <Button>Back to My Pickups</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const currentStep = getCurrentStep(pickup.status)

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/my-pickups" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <span>←</span> Back to My Pickups
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Pickup Details */}
            <Card padding="lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-3xl">
                    🗑️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Pickup #{pickup._id?.slice(-6)}
                    </h2>
                    <p className="text-gray-500">Waste Collection</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(pickup.status)} text-sm`}>
                  {getStatusLabel(pickup.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">📍</span>
                  <span>{pickup.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">📅</span>
                  <span>{formatDate(pickup.scheduledDate, 'EEEE, MMMM dd, yyyy - h:mm a')}</span>
                </div>
                {pickup.estimatedWeight && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-xl">⚖️</span>
                    <span>Estimated Weight: {pickup.estimatedWeight} kg</span>
                  </div>
                )}
                {pickup.notes && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-xl">📝</span>
                    <span>{pickup.notes}</span>
                  </div>
                )}
              </div>

              {pickup.price > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(pickup.price)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Driver Info (if assigned) */}
            {pickup.driver && (
              <Card padding="lg">
                <CardTitle className="mb-4">Driver Information</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                    {pickup.driver.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pickup.driver.name}</p>
                    <p className="text-sm text-gray-500">{pickup.driver.phone}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Timeline */}
          <div className="md:col-span-1">
            <Card padding="lg">
              <CardTitle className="mb-6">Status Timeline</CardTitle>
              
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep
                  const isCurrent = index === currentStep
                  
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${isCompleted 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                        }
                        ${isCurrent ? 'ring-4 ring-primary-200' : ''}
                      `}>
                        {step.icon}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className={`
                          font-medium
                          ${isCompleted ? 'text-gray-800' : 'text-gray-400'}
                        `}>
                          {step.label}
                        </p>
                        {isCurrent && pickup.status === step.key && (
                          <p className="text-xs text-primary-600">Current Status</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Actions */}
            {pickup.status === 'pending' && (
              <Card padding="md" className="mt-4">
                <p className="text-sm text-gray-600 mb-3">Need to make changes?</p>
                <div className="space-y-2">
                  <Button variant="secondary" fullWidth size="sm">
                    Reschedule
                  </Button>
                  <Button variant="ghost" fullWidth size="sm">
                    Cancel Request
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TrackPickup