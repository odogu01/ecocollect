import mongoose from 'mongoose'

const pickupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: [true, 'Pickup address is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedWeight: {
    type: Number,
    min: [0.1, 'Weight must be at least 0.1 kg'],
    default: 1
  },
  actualWeight: {
    type: Number,
    min: 0
  },
  price: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  pickedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, {
  timestamps: true
})

// Indexes for efficient queries
pickupSchema.index({ user: 1, createdAt: -1 })
pickupSchema.index({ status: 1 })
pickupSchema.index({ driver: 1 })
pickupSchema.index({ scheduledDate: 1 })
pickupSchema.index({ paymentStatus: 1 })

// Virtual for pickup ID
pickupSchema.virtual('pickupId').get(function() {
  return this._id.toString().slice(-6).toUpperCase()
})

// Populate category and user virtuals
pickupSchema.set('toJSON', { virtuals: true })
pickupSchema.set('toObject', { virtuals: true })

const Pickup = mongoose.model('Pickup', pickupSchema)

export default Pickup