import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pickup',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: String,
  receiptUrl: String,
  failureReason: String
}, {
  timestamps: true
})

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 })
paymentSchema.index({ pickup: 1 })
paymentSchema.index({ status: 1 })

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment