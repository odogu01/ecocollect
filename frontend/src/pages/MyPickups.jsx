import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { pickupAPI } from '../services/api'
import { LoadingSpinner, Card, CardTitle, Select, Badge } from '../components/common'
import PickupList from '../components/dashboard/PickupList'
import Navbar from '../components/layout/Navbar'
import { Alert } from '../components/common'
import { getStatusLabel } from '../utils/helpers'

const MyPickups = () => {
  const [searchParams] = useSearchParams()
  const successMessage = searchParams.get('success')
  
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchPickups()
  }, [filter, page])

  const fetchPickups = async () => {
    try {
      const params = { page, limit: 9 }
      if (filter !== 'all') {
        params.status = filter
      }
      const response = await pickupAPI.getAll(params)
      setPickups(response.data.pickups || [])
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Failed to fetch pickups:', err)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'picked', label: 'Picked Up' },
    { value: 'completed', label: 'Completed' }
  ]

  const filteredPickups = filter === 'all' 
    ? pickups 
    : pickups.filter(p => p.status === filter)

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Pickups</h1>
            <p className="text-gray-600 mt-2">Track and manage your waste collection requests</p>
          </div>
          
          <div className="mt-4 md:mt-0 w-full md:w-48">
            <Select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
              options={statusOptions}
            />
          </div>
        </div>

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            className="mb-6"
          />
        )}

        {loading ? (
          <LoadingSpinner text="Loading your pickups..." />
        ) : (
          <>
            <PickupList
              pickups={filteredPickups}
              emptyMessage="No pickups found. Request your first pickup!"
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Summary */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending', 'assigned', 'picked', 'completed'].map(status => {
            const count = pickups.filter(p => p.status === status).length
            return (
              <Card key={status} padding="md" className="text-center">
                <p className="text-3xl font-bold text-gray-800">{count}</p>
                <p className="text-sm text-gray-500">{getStatusLabel(status)}</p>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default MyPickups