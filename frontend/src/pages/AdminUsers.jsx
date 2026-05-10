import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import { LoadingSpinner, Card, CardTitle, Select, Button, Badge, Modal, Input } from '../components/common'
import Navbar from '../components/layout/Navbar'
import { getRoleLabel } from '../utils/helpers'

// Port Harcourt locations for filter
const PORTHARCOURT_LOCATIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Ada-George', label: 'Ada-George' },
  { value: 'Aluu', label: 'Aluu' },
  { value: 'Amadi-Ama', label: 'Amadi-Ama' },
  { value: 'Bori', label: 'Bori' },
  { value: 'Choba', label: 'Choba' },
  { value: 'D-Line', label: 'D-Line' },
  { value: 'Dakata', label: 'Dakata' },
  { value: 'Elekahia', label: 'Elekahia' },
  { value: 'Elelenwo', label: 'Elelenwo' },
  { value: 'Eneka', label: 'Eneka' },
  { value: 'New GRA', label: 'New GRA' },
  { value: 'Nkpolu', label: 'Nkpolu' },
  { value: 'Oyigbo', label: 'Oyigbo' },
  { value: 'Rumuigbo', label: 'Rumuigbo' },
  { value: 'Trans-Amadi', label: 'Trans-Amadi' },
  { value: 'Woji', label: 'Woji' },
  { value: 'Other', label: 'Other' }
]

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'resident'
  })

  useEffect(() => {
    fetchUsers()
    fetchCities()
  }, [filter, cityFilter])

  const fetchUsers = async () => {
    try {
      const params = {}
      if (filter !== 'all') params.role = filter
      if (cityFilter) params.city = cityFilter
      const response = await userAPI.getAll(params)
      setUsers(response.data.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await userAPI.getCities()
      setCities(response.data.cities || [])
    } catch (err) {
      console.error('Failed to fetch cities:', err)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await userAPI.approve(userId)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve user')
      console.error('Failed to approve user:', err)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await userAPI.delete(userId)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
      console.error('Failed to delete user:', err)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await userAPI.create(newUser)
      setShowAddModal(false)
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'resident' })
      fetchUsers()
    } catch (err) {
      console.error('Failed to create user:', err)
    }
  }

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'company', label: 'Company' },
    { value: 'driver', label: 'Driver' },
    { value: 'resident', label: 'Resident' }
  ]

  const createRoleOptions = [
    { value: 'resident', label: 'Resident' },
    { value: 'company', label: 'Company' },
    { value: 'driver', label: 'Driver' }
  ]

  const getStatusBadge = (user) => {
    if (user.isApproved === false) {
      return <Badge variant="warning">Pending</Badge>
    }
    return <Badge variant="success">Active</Badge>
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all users in the system</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={roleOptions}
            />
            <Select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              options={PORTHARCOURT_LOCATIONS}
              placeholder="Filter by location"
            />
            <Button onClick={() => setShowAddModal(true)} icon="➕">
              Add User
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading users..." />
        ) : (
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{user.city || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary">{getRoleLabel(user.role)}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user.isApproved === false && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user._id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </Card>
        )}

        {/* Add User Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New User"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              value={newUser.phone}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Select
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              options={createRoleOptions}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" fullWidth>
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}

export default AdminUsers