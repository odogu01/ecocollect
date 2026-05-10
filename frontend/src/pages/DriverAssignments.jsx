import { useState, useEffect } from 'react'
import { pickupAPI } from '../services/api'
import { LoadingSpinner, Card, CardTitle, Button, Alert } from '../components/common'
import Navbar from '../components/layout/Navbar'
import PickupList from '../components/dashboard/PickupList'
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers'

const DriverAssignments = () => {
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await pickupAPI.getMyPickups()
      setPickups(response.data.pickups || [])
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (pickupId, newStatus) => {
    setActionLoading(true)
    try {
      await pickupAPI.updateStatus(pickupId, newStatus)
      fetchAssignments()
      setSelectedPickup(null)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const startRoute = () => {
    alert('Route navigation would open here! (Google Maps / Maps integration)')
  }

  // Group pickups by status
  const pendingPickups = pickups.filter(p => p.status === 'assigned')
  const inProgressPickups = pickups.filter(p => p.status === 'picked')
  const completedToday = pickups.filter(p => {
    if (p.status !== 'completed') return false
    const completedDate = new Date(p.updatedAt)
    const today = new Date()
    return completedDate.toDateString() === today.toDateString()
  })

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your assignments..." />
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Assignments</h1>
          <p className="text-gray-600 mt-2">Manage your pickup route for today</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card padding="md" className="text-center">
            <p className="text-4xl font-bold text-primary-600">{pendingPickups.length}</p>
            <p className="text-gray-500">Pending Pickups</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-4xl font-bold text-purple-600">{inProgressPickups.length}</p>
            <p className="text-gray-500">In Progress</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-4xl font-bold text-green-600">{completedToday.length}</p>
            <p className="text-gray-500">Completed Today</p>
          </Card>
        </div>

        {/* Start Route Button */}
        {pendingPickups.length > 0 && (
          <div className="mb-8">
            <Button
              size="lg"
              fullWidth
              onClick={startRoute}
              icon="🗺️"
            >
              Start Route ({pendingPickups.length} pickups)
            </Button>
          </div>
        )}

        {/* Pending Pickups */}
        {pendingPickups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Pickups</h2>
            <PickupList
              pickups={pendingPickups}
              showActions
              isDriver
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* In Progress */}
        {inProgressPickups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">In Progress</h2>
            <PickupList
              pickups={inProgressPickups}
              showActions
              isDriver
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Empty State */}
        {pickups.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Assignments</h3>
            <p className="text-gray-500">You don't have any pickup assignments yet.</p>
          </Card>
        )}
      </main>
    </div>
  )
}

export default DriverAssignments