import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { trashCanAPI } from '../services/api'
import { Card, CardTitle, Button, Alert, LoadingSpinner, Input } from '../components/common'
import Navbar from '../components/layout/Navbar'

const DriverDeliveries = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, outForDelivery: 0, delivered: 0, total: 0 })
  const [trashCans, setTrashCans] = useState([])
  const [selectedCan, setSelectedCan] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await trashCanAPI.getMyDeliveries()
      setStats(response.data.stats)
      setTrashCans(response.data.trashCans || [])
    } catch (err) {
      setError('Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }

  const handleStartDelivery = async (canId) => {
    setUpdating(true)
    setError('')

    try {
      await trashCanAPI.updateStatus(canId, 'out_for_delivery')
      setSuccess('Started delivery!')
      fetchDeliveries()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start delivery')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeliver = async (canId) => {
    if (!deliveryAddress) {
      setError('Please enter the delivery address')
      return
    }

    setUpdating(true)
    setError('')

    try {
      const response = await trashCanAPI.deliver(canId, {
        deliveryAddress,
        notes: ''
      })
      setSuccess(response.data.message)
      setSelectedCan(null)
      setDeliveryAddress('')
      fetchDeliveries()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete delivery')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading deliveries..." />
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Trash Can Deliveries</h1>
          <p className="text-gray-600 mt-2">Deliver trash cans to resident customers</p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} className="mb-4" onClose={() => setSuccess('')} />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="md" className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.outForDelivery}</p>
            <p className="text-sm text-gray-600">Out for Delivery</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-600">Delivered Today</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Assigned</p>
          </Card>
        </div>

        {/* Deliveries List */}
        <Card padding="lg">
          <CardTitle className="mb-6">Your Deliveries</CardTitle>

          {trashCans.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-5xl">📦</span>
              <p className="text-gray-500 mt-4">No deliveries assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trashCans.map(can => (
                <div
                  key={can._id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🗑️</span>
                        <span className="font-medium text-gray-800">
                          Trash Can #{can.canNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          can.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          can.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {can.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Customer:</strong> {can.user?.name}</p>
                        <p><strong>Phone:</strong> {can.user?.phone}</p>
                        <p><strong>Address:</strong> {can.user?.address || 'Not specified'}</p>
                        <p><strong>Type:</strong> {can.canType === 'recyclable' ? '♻️ Recyclable' : '🗑️ General'}</p>
                      </div>

                      {can.status === 'delivered' && can.deliveredAt && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Delivered at {new Date(can.deliveredAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    <div className="ml-4">
                      {can.status === 'assigned' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartDelivery(can._id)}
                          disabled={updating}
                        >
                          Start Delivery 🚚
                        </Button>
                      )}

                      {can.status === 'out_for_delivery' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedCan(can)}
                        >
                          Mark Delivered ✓
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delivery Form */}
                  {selectedCan?._id === can._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-700 mb-3">Confirm Delivery</p>
                      <Input
                        label="Delivery Address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter the delivery address confirmed with customer"
                        icon="📍"
                      />
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleDeliver(can._id)}
                          loading={updating}
                          icon="✓"
                        >
                          Confirm Delivery
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedCan(null)
                            setDeliveryAddress('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-medium text-blue-800 mb-2">📋 Delivery Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Start Delivery" when you begin your route</li>
            <li>2. Contact the customer to confirm the delivery address</li>
            <li>3. Click "Mark Delivered" after successfully delivering the trash can</li>
            <li>4. Each customer receives 2 trash cans (1 general, 1 recyclable)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default DriverDeliveries