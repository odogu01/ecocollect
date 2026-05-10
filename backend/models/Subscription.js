import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['monthly'],
    default: 'monthly'
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discountCode: {
    type: String,
    default: null
  },
  finalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  trashCansAssigned: {
    type: Number,
    default: 2
  },
  trashCansDelivered: {
    type: Number,
    default: 0
  },
  isFirstSubscription: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate end date before saving
subscriptionSchema.pre('save', function(next) {
  const start = new Date(this.startDate)
  this.endDate = new Date(start.setMonth(start.getMonth() + this.durationMonths))
  this.totalPrice = this.monthlyPrice * this.durationMonths
  this.finalPrice = this.totalPrice - this.discount
  next()
})

// Index for queries
subscriptionSchema.index({ user: 1 })
subscriptionSchema.index({ status: 1 })
subscriptionSchema.index({ endDate: 1 })

const Subscription = mongoose.model('Subscription', subscriptionSchema)

export default Subscription