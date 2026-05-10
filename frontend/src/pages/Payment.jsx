import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentAPI } from '../services/api'
import { LoadingSpinner, Button, Card, CardTitle, Alert } from '../components/common'
import Navbar from '../components/layout/Navbar'
import { formatCurrency } from '../utils/helpers'

// Initialize Stripe (use test key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder')

const CheckoutForm = ({ pickup, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create payment intent
      const intentResponse = await paymentAPI.createIntent(pickup._id)
      const { clientSecret } = intentResponse.data

      // Confirm payment
      const cardElement = elements.getElement(CardElement)
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      })

      if (stripeError) {
        setError(stripeError.message)
        onError(stripeError.message)
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentAPI.confirm(pickup._id, paymentIntent.id)
        onSuccess()
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Payment failed. Please try again.'
      setError(message)
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#9e2146'
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={loading}
        disabled={!stripe}
        icon="💳"
      >
        Pay {formatCurrency(pickup.price)}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Your payment is secured by Stripe
      </p>
    </form>
  )
}

const Payment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [pickup, setPickup] = useState(location.state?.pickup || null)
  const [loading, setLoading] = useState(!pickup)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!pickup && id) {
      fetchPickup()
    }
  }, [id, pickup])

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

  const handlePaymentSuccess = () => {
    navigate('/my-pickups', {
      state: { success: 'Payment successful! Your pickup has been scheduled.' }
    })
  }

  const handlePaymentError = (message) => {
    setError(message)
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading payment..." />
  }

  if (!pickup) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-8 text-center">
          <p className="text-red-500">Pickup not found</p>
          <Button onClick={() => navigate('/my-pickups')} className="mt-4">
            Back to My Pickups
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Complete Payment</h1>
          <p className="text-gray-600 mt-2">Secure your pickup request</p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />
        )}

        <div className="space-y-6">
          {/* Order Summary */}
          <Card padding="lg">
            <CardTitle className="mb-4">Order Summary</CardTitle>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup ID</span>
                <span className="font-medium">#{pickup._id?.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">Waste Collection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <span className="font-medium text-right max-w-[150px]">{pickup.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(pickup.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(pickup.price)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Card padding="lg">
            <CardTitle className="mb-4">Payment Details</CardTitle>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                pickup={pickup}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </Card>

          {/* Cancel Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/my-pickups')}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel and go back
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Payment