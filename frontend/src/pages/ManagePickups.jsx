import { useState, useEffect } from 'react'
import { pickupAPI, userAPI } from '../services/api'
import { LoadingSpinner, Card, CardTitle, Select, Button, Modal, Badge } from '../components/common'
import Navbar from '../components/layout/Navbar'
import { formatDate, getStatusColor, getStatusLabel } from '../utils/helpers'

const ManagePickups = () => {
  const [pickups, setPickups] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedPickup, setSelectedPickup] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const params = { limit: 50 }
      if (filter !== 'all') params.status = filter
      
      const [pickupsRes, driversRes] = await Promise.all([
        pickupAPI.getAll(params),
        userAPI.getDrivers()
      ])
      
      setPickups(pickupsRes.data.pickups || [])
      setDrivers(driversRes.data.drivers || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDriver = async () => {
    if (!selectedPickup || !selectedDriver) return

    try {
      await pickupAPI.assignDriver(selectedPickup._id, selectedDriver)
      setShowAssignModal(false)
      setSelectedPickup(null)
      setSelectedDriver('')
      fetchData()
    } catch (err) {
      console.error('Failed to assign driver:', err)
    }
  }

  const handleStatusChange = async (pickupId, newStatus) => {
    try {
      await pickupAPI.updateStatus(pickupId, newStatus)
      fetchData()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'picked', label: 'Picked' },
    { value: 'completed', label: 'Completed' }
  ]

  const driverOptions = [
    { value: '', label: 'Select a driver...' },
    ...drivers.map(d => ({ value: d._id, label: d.name }))
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Pickups</h1>
            <p className="text-gray-600 mt-2">View and manage all pickup requests</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading pickups..." />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Address</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Driver</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pickups.map(pickup => (
                    <tr key={pickup._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        #{pickup._id?.slice(-6)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span>🗑️</span>
                          <span className="text-sm">Waste Collection</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {pickup.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(pickup.scheduledDate, 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{pickup.user?.name}</p>
                          <p className="text-gray-500">{pickup.user?.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {pickup.driver ? (
                          <div>
                            <p className="font-medium text-gray-800">{pickup.driver.name}</p>
                            <p className="text-gray-500">{pickup.driver.phone}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`status-badge ${getStatusColor(pickup.status)}`}>
                          {getStatusLabel(pickup.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {pickup.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPickup(pickup)
                                setShowAssignModal(true)
                              }}
                            >
                              Assign
                            </Button>
                          )}
                          {pickup.status === 'assigned' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStatusChange(pickup._id, 'picked')}
                            >
                              Mark Picked
                            </Button>
                          )}
                          {pickup.status === 'picked' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusChange(pickup._id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pickups.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">No pickups found</p>
              </div>
            )}
          </Card>
        )}

        {/* Assign Driver Modal */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedPickup(null)
            setSelectedDriver('')
          }}
          title="Assign Driver"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a driver for pickup #{selectedPickup?._id?.slice(-6)}
            </p>
            <Select
              label="Driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              options={driverOptions}
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedPickup(null)
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleAssignDriver}
                disabled={!selectedDriver}
              >
                Assign
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}

export default ManagePickups