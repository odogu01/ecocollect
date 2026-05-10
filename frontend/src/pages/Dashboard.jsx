import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { pickupAPI, userAPI } from '../services/api'
import { formatCurrency } from '../utils/helpers'
import { StatCard, MetricGrid } from '../components/dashboard/StatCard'
import PickupList from '../components/dashboard/PickupList'
import { LoadingSpinner, Card, CardTitle, Button, Alert } from '../components/common'
import Navbar from '../components/layout/Navbar'

const Dashboard = () => {
  const { user, isAdmin, isCompany, isDriver, isResident } = useAuth()
  const { notifications } = useSocket()
  const [stats, setStats] = useState(null)
  const [recentPickups, setRecentPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertSending, setAlertSending] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState('')
  const [alertError, setAlertError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pickupsRes] = await Promise.all([
        pickupAPI.getStats(),
        pickupAPI.getMyPickups()
      ])
      setStats(statsRes.data)
      setRecentPickups(pickupsRes.data.pickups?.slice(0, 6) || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrashCanAlert = async () => {
    setAlertSending(true)
    setAlertError('')
    setAlertSuccess('')

    try {
      await userAPI.trashCanAlert({
        message: `My trash can is full and needs collection. Location: ${user?.city}`
      })
      setAlertSuccess('Alert sent! We will collect your trash soon.')
    } catch (err) {
      setAlertError(err.response?.data?.message || 'Failed to send alert')
    } finally {
      setAlertSending(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />
  }

  const renderAdminDashboard = () => (
    <>
      <MetricGrid>
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="primary"
        />
        <StatCard
          title="Total Pickups"
          value={stats?.totalPickups || 0}
          icon="📦"
          color="secondary"
        />
        <StatCard
          title="Pending Pickups"
          value={stats?.pendingPickups || 0}
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="Completed"
          value={stats?.completedPickups || 0}
          icon="✅"
          color="success"
        />
      </MetricGrid>

      <div className="mt-8">
        <Card padding="md">
          <CardTitle className="mb-4">Recent Pickups</CardTitle>
          <PickupList pickups={recentPickups} />
        </Card>
      </div>
    </>
  )

  const renderCompanyDashboard = () => (
    <>
      <MetricGrid>
        <StatCard
          title="Total Pickups"
          value={stats?.totalPickups || 0}
          icon="📦"
          color="primary"
        />
        <StatCard
          title="Pending Assignment"
          value={stats?.pendingPickups || 0}
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="Active Drivers"
          value={stats?.activeDrivers || 0}
          icon="🚚"
          color="secondary"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats?.revenue || 0)}
          icon="💰"
          color="success"
        />
      </MetricGrid>

      <div className="mt-8">
        <Card padding="md">
          <CardTitle className="mb-4">Pickups Requiring Action</CardTitle>
          <PickupList
            pickups={recentPickups.filter(p => p.status === 'pending' || !p.driver)}
            emptyMessage="All pickups are assigned"
          />
        </Card>
      </div>
    </>
  )

  const renderDriverDashboard = () => (
    <>
      <MetricGrid>
        <StatCard
          title="Today's Pickups"
          value={stats?.todayPickups || 0}
          icon="📅"
          color="primary"
        />
        <StatCard
          title="Pending Pickup"
          value={stats?.pendingPickups || 0}
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressPickups || 0}
          icon="🚚"
          color="secondary"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon="✅"
          color="success"
        />
      </MetricGrid>

      <div className="mt-8">
        <Card padding="md">
          <CardTitle className="mb-4">Your Assignments</CardTitle>
          <PickupList
            pickups={recentPickups}
            showActions
            isDriver
          />
        </Card>
      </div>
    </>
  )

  const renderResidentDashboard = () => (
    <>
      {/* Trash Can Full Alert Section */}
      {user?.hasActiveSubscription && (
        <div className="mb-6">
          <Card padding="lg" className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl">
                  🗑️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Trash Can Full?</h3>
                  <p className="text-sm text-gray-600">
                    Click the button to notify us that your trash can needs collection
                  </p>
                </div>
              </div>
              <Button
                onClick={handleTrashCanAlert}
                loading={alertSending}
                icon="🔔"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Report Full Trash Can
              </Button>
            </div>

            {alertSuccess && (
              <Alert type="success" message={alertSuccess} className="mt-4" onClose={() => setAlertSuccess('')} />
            )}
            {alertError && (
              <Alert type="error" message={alertError} className="mt-4" onClose={() => setAlertError('')} />
            )}
          </Card>
        </div>
      )}

      <MetricGrid>
        <StatCard
          title="My Pickups"
          value={stats?.totalPickups || 0}
          icon="📦"
          color="primary"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingPickups || 0}
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="Completed"
          value={stats?.completedPickups || 0}
          icon="✅"
          color="success"
        />
        <StatCard
          title="Trash Cans"
          value={`${user?.trashCansAssigned || 0} Assigned`}
          icon="🗑️"
          color="secondary"
        />
      </MetricGrid>

      <div className="mt-8">
        <Card padding="md">
          <CardTitle className="mb-4">Recent Pickups</CardTitle>
          <PickupList pickups={recentPickups} />
        </Card>
      </div>
    </>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your waste collection today.
          </p>
        </div>

        {/* Real-time notifications indicator */}
        {notifications.length > 0 && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-sm font-medium text-primary-800">
                You have {notifications.length} new notification{notifications.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-primary-600">
                Latest: {notifications[0].message || notifications[0].type}
              </p>
            </div>
          </div>
        )}

        {/* Role-specific dashboard content */}
        {isAdmin && renderAdminDashboard()}
        {isCompany && renderCompanyDashboard()}
        {isDriver && renderDriverDashboard()}
        {isResident && renderResidentDashboard()}
      </main>
    </div>
  )
}

export default Dashboard