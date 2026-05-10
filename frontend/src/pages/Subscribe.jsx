import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscriptionAPI } from '../services/api'
import { formatCurrency } from '../utils/helpers'
import { Button, Card, CardTitle, Input, Alert, LoadingSpinner } from '../components/common'
import Navbar from '../components/layout/Navbar'

const Subscribe = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [showDiscountInput, setShowDiscountInput] = useState(false)

  const [formData, setFormData] = useState({
    durationMonths: 1,
    hasAgreed: false
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    try {
      const response = await subscriptionAPI.getPricing()
      setPricing(response.data.pricing)
    } catch (err) {
      setError('Failed to load pricing information')
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!pricing) return { monthly: 0, total: 0, discount: 0, final: 0 }

    const monthly = pricing.monthlyPrice
    let total = monthly * formData.durationMonths
    let discount = 0

    // New user discount
    if (user?.isNewUser && pricing.newUserDiscount > 0) {
      discount += (monthly * pricing.newUserDiscount) / 100
    }

    // Discount code
    if (discountCode && pricing.discountCode === discountCode.toUpperCase()) {
      const codeDiscount = (monthly * pricing.newUserDiscount) / 100
      discount = Math.max(discount, codeDiscount)
    }

    // Multi-month discount
    if (formData.durationMonths === 2 && pricing.discount2Months > 0) {
      const multiMonthDiscount = (monthly * pricing.discount2Months) / 100 * formData.durationMonths
      discount = Math.max(discount, multiMonthDiscount)
    } else if (formData.durationMonths === 3 && pricing.discount3Months > 0) {
      const multiMonthDiscount = (monthly * pricing.discount3Months) / 100 * formData.durationMonths
      discount = Math.max(discount, multiMonthDiscount)
    }

    const final = total - discount

    return { monthly, total, discount, final }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.hasAgreed) {
      setError('Please agree to the terms and conditions')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await subscriptionAPI.create({
        durationMonths: formData.durationMonths,
        discountCode: discountCode || null
      })

      // Update user context with subscription info
      updateUser({
        ...user,
        hasActiveSubscription: true,
        trashCansAssigned: 2
      })

      // Navigate to payment (simplified - direct success for now)
      navigate('/dashboard', {
        state: {
          success: 'Subscription activated! 2 trash cans have been assigned to you.',
          subscription: response.data.subscription
        }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subscription')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading pricing..." />
  }

  const price = calculatePrice()

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Subscribe to EcoCollect</h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Get 2 trash cans delivered to your home with your subscription
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />
        )}

        <form onSubmit={handleSubmit}>
          {/* Plan Selection */}
          <Card padding="lg" className="mb-6">
            <CardTitle className="mb-6">Select Your Plan</CardTitle>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, durationMonths: months }))}
                  className={`
                    p-2 sm:p-4 lg:p-6 rounded-xl border-2 transition-all text-center min-h-[80px] sm:min-h-[100px]
                    ${formData.durationMonths === months
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-center">
                    <p className="text-sm sm:text-base lg:text-xl font-bold text-gray-800">{months} Mo{months > 1 ? 's' : ''}</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-bold text-primary-600 mt-0.5 sm:mt-2">
                      {formatCurrency(pricing?.monthlyPrice || 5000)}
                    </p>
                    <span className="text-[10px] sm:text-xs text-gray-500">/mo</span>
                    {months === 2 && pricing?.discount2Months > 0 && (
                      <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">Save {pricing.discount2Months}%</p>
                    )}
                    {months === 3 && pricing?.discount3Months > 0 && (
                      <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">Save {pricing.discount3Months}%</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Discount Code */}
            <div className="mb-4 sm:mb-6">
              {!showDiscountInput ? (
                <button
                  type="button"
                  onClick={() => setShowDiscountInput(true)}
                  className="text-primary-600 hover:underline text-xs sm:text-sm"
                >
                  Have a discount code?
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDiscountCode('')}
                    className="text-xs sm:text-sm"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* New User Badge */}
            {user?.isNewUser && pricing?.newUserDiscount > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">🎉</span>
                <div>
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    New User Discount: {pricing.newUserDiscount}% OFF!
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    You're eligible for a special discount as a new user
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Price Summary */}
          <Card padding="lg" className="mb-6">
            <CardTitle className="mb-4">Order Summary</CardTitle>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 text-sm sm:text-base">Monthly Price</span>
                <span className="text-gray-800 text-sm sm:text-base font-medium">{formatCurrency(price.monthly)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 text-sm sm:text-base">Duration</span>
                <span className="text-gray-800 text-sm sm:text-base font-medium">{formData.durationMonths} month(s)</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
                <span className="text-gray-800 text-sm sm:text-base font-medium">{formatCurrency(price.total)}</span>
              </div>

              {price.discount > 0 && (
                <div className="flex justify-between gap-2 text-green-600">
                  <span className="text-sm sm:text-base">Discount</span>
                  <span className="text-sm sm:text-base font-medium">-{formatCurrency(price.discount)}</span>
                </div>
              )}

              <div className="border-t pt-2 sm:pt-3 flex justify-between gap-2">
                <span className="text-base sm:text-lg font-bold text-gray-800">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">{formatCurrency(price.final)}</span>
              </div>
            </div>

            {/* Trash Cans Info */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl flex-shrink-0">🗑️</span>
                <div>
                  <p className="font-medium text-primary-800 text-sm sm:text-base">What's Included:</p>
                  <ul className="text-xs sm:text-sm text-primary-700 mt-1 space-y-0.5">
                    <li>• 2 trash cans (1 general, 1 recyclable)</li>
                    <li>• Free delivery to your address</li>
                    <li>• Pickup service included</li>
                    <li>• Cancel anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Terms */}
          <Card padding="md" sm:padding="lg" className="mb-6">
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasAgreed}
                onChange={(e) => setFormData(prev => ({ ...prev, hasAgreed: e.target.checked }))}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 flex-shrink-0"
              />
              <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                I agree to the subscription terms and conditions. I understand that my subscription
                will auto-renew monthly until cancelled.
              </span>
            </label>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={submitting}
            icon="📦"
          >
            Subscribe & Get 2 Trash Cans
          </Button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 text-sm">
            Questions? Contact us at support@ecocollect.com
          </p>
        </div>
      </main>
    </div>
  )
}

export default Subscribe