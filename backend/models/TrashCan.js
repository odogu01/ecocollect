import mongoose from 'mongoose'

const trashCanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  canNumber: {
    type: Number,
    required: true,
    enum: [1, 2] // Each user gets 2 trash cans
  },
  canType: {
    type: String,
    enum: ['recyclable', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'out_for_delivery', 'delivered', 'active', 'retired'],
    default: 'pending'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  deliveryAddress: {
    type: String
  },
  notes: {
    type: String
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
})

// Index for queries
trashCanSchema.index({ user: 1 })
trashCanSchema.index({ status: 1 })
trashCanSchema.index({ assignedDriver: 1 })

const TrashCan = mongoose.model('TrashCan', trashCanSchema)

export default TrashCan