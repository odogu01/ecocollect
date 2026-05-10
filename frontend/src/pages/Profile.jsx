import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Input, Button, Card, CardTitle, Alert } from '../components/common'
import Navbar from '../components/layout/Navbar'
import { getRoleLabel, getInitials } from '../utils/helpers'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    companyName: user?.companyName || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await authAPI.updateProfile(formData)
      updateUser(response.data.user)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {message.text && (
          <Alert
            type={message.type}
            message={message.text}
            className="mb-6"
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        {/* Profile Info Card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <CardTitle className="mb-4">Personal Information</CardTitle>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon="👤"
              />
              
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon="📱"
              />
              
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                icon="📍"
              />

              {user?.role === 'company' && (
                <Input
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  icon="🏢"
                />
              )}
            </div>

            <Button
              type="submit"
              className="mt-6"
              loading={loading}
            >
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Password Update Card */}
        <Card padding="lg">
          <CardTitle className="mb-4">Change Password</CardTitle>
          
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                icon="🔒"
                required
              />
              
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon="🔑"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon="🔐"
                required
              />
            </div>

            <Button
              type="submit"
              className="mt-6"
              loading={loading}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}

export default Profile