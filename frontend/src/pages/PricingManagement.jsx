import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { pricingAPI, userAPI } from '../services/api'
import { Button, Card, CardTitle, Input, Alert, LoadingSpinner, Select } from '../components/common'
import Navbar from '../components/layout/Navbar'

const PricingManagement = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [pricing, setPricing] = useState({
    monthlyPrice: '',
    newUserDiscount: '',
    discountCode: '',
    discountDescription: '',
    discount2Months: '',
    discount3Months: ''
  })

  const [drivers, setDrivers] = useState([])
  const [trashCans, setTrashCans] = useState([])
  const [activeTab, setActiveTab] = useState('pricing')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pricingRes, driversRes, trashCansRes] = await Promise.all([
        pricingAPI.get(),
        userAPI.getDrivers(),
        fetch('/api/trashcans/all').then(r => r.json()).catch(() => ({ data: { trashCans: [] } }))
      ])

      const p = pricingRes.data.pricing || {}
      setPricing({
        monthlyPrice: p.monthlyPrice || '',
        newUserDiscount: p.newUserDiscount || '',
        discountCode: p.discountCode || '',
        discountDescription: p.discountDescription || '',
        discount2Months: p.discount2Months || '',
        discount3Months: p.discount3Months || ''
      })

      setDrivers(driversRes.data?.users || [])
      setTrashCans(trashCansRes.data?.trashCans || [])
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handlePricingSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await pricingAPI.update({
        monthlyPrice: parseFloat(pricing.monthlyPrice),
        newUserDiscount: parseFloat(pricing.newUserDiscount) || 0,
        discountCode: pricing.discountCode || null,
        discountDescription: pricing.discountDescription || '',
        discount2Months: parseFloat(pricing.discount2Months) || 0,
        discount3Months: parseFloat(pricing.discount3Months) || 0
      })

      setSuccess('Pricing updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pricing')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscountCodeSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await pricingAPI.setDiscountCode({
        code: pricing.discountCode,
        discountPercentage: parseFloat(pricing.newUserDiscount),
        description: pricing.discountDescription
      })

      setSuccess('Discount code updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update discount code')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignDriver = async (trashCanId, driverId) => {
    try {
      await fetch(`/api/trashcans/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ trashCanIds: [trashCanId], driverId })
      })
      fetchData()
    } catch (err) {
      setError('Failed to assign driver')
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pricing & Delivery Management</h1>
          <p className="text-gray-600 mt-2">Manage subscription pricing and trash can deliveries</p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} className="mb-4" onClose={() => setSuccess('')} />
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pricing'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Subscription Pricing
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'discounts'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Discount Codes
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'deliveries'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trash Can Deliveries
          </button>
        </div>

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <form onSubmit={handlePricingSubmit}>
            <Card padding="lg">
              <CardTitle className="mb-6">Monthly Subscription Price</CardTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Monthly Price (Naira)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.monthlyPrice}
                  onChange={(e) => setPricing(prev => ({ ...prev, monthlyPrice: e.target.value }))}
                  required
                  icon="💰"
                />

                <Input
                  label="2-Month Discount (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.discount2Months}
                  onChange={(e) => setPricing(prev => ({ ...prev, discount2Months: e.target.value }))}
                  icon="📅"
                />

                <Input
                  label="3-Month Discount (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.discount3Months}
                  onChange={(e) => setPricing(prev => ({ ...prev, discount3Months: e.target.value }))}
                  icon="📅"
                />
              </div>

              <Button type="submit" loading={saving} icon="💾">
                Save Pricing
              </Button>
            </Card>
          </form>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <form onSubmit={handleDiscountCodeSubmit}>
            <Card padding="lg">
              <CardTitle className="mb-6">New User Discount Code</CardTitle>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-blue-800">
                  This discount will be automatically applied to all new users when they subscribe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Discount Code"
                  type="text"
                  value={pricing.discountCode}
                  onChange={(e) => setPricing(prev => ({ ...prev, discountCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g., WELCOME20"
                  icon="🏷️"
                />

                <Input
                  label="Discount Percentage (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.newUserDiscount}
                  onChange={(e) => setPricing(prev => ({ ...prev, newUserDiscount: e.target.value }))}
                  icon="🎁"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={pricing.discountDescription}
                    onChange={(e) => setPricing(prev => ({ ...prev, discountDescription: e.target.value }))}
                    placeholder="Describe the discount..."
                    className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    rows={2}
                  />
                </div>
              </div>

              {/* Current Discount Display */}
              {pricing.discountCode && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                  <p className="font-medium text-green-800">
                    Current Active: {pricing.discountCode} - {pricing.newUserDiscount || 0}% off
                  </p>
                </div>
              )}

              <Button type="submit" loading={saving} icon="🏷️">
                Update Discount Code
              </Button>
            </Card>
          </form>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            <Card padding="lg">
              <CardTitle className="mb-6">Pending Deliveries</CardTitle>

              {trashCans.filter(tc => tc.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending deliveries</p>
              ) : (
                <div className="space-y-4">
                  {trashCans
                    .filter(tc => tc.status === 'pending')
                    .map(can => (
                      <div key={can._id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              Trash Can #{can.canNumber} - {can.canType}
                            </p>
                            <p className="text-sm text-gray-500">
                              User: {can.user?.name} - {can.user?.address}
                            </p>
                          </div>
                          <Select
                            value=""
                            onChange={(e) => handleAssignDriver(can._id, e.target.value)}
                            options={[
                              { value: '', label: 'Assign Driver...' },
                              ...drivers.map(d => ({ value: d._id, label: d.name }))
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            <Card padding="lg">
              <CardTitle className="mb-6">All Deliveries</CardTitle>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-600">Can #</th>
                      <th className="pb-3 font-medium text-gray-600">User</th>
                      <th className="pb-3 font-medium text-gray-600">Type</th>
                      <th className="pb-3 font-medium text-gray-600">Status</th>
                      <th className="pb-3 font-medium text-gray-600">Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashCans.map(can => (
                      <tr key={can._id} className="border-b border-gray-100">
                        <td className="py-3">{can.canNumber}</td>
                        <td className="py-3">{can.user?.name}</td>
                        <td className="py-3 capitalize">{can.canType}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            can.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            can.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                            can.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {can.status}
                          </span>
                        </td>
                        <td className="py-3">{can.assignedDriver?.name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default PricingManagement