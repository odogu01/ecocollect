import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pickup', 'payment', 'status', 'system', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    pickupId: mongoose.Schema.Types.ObjectId,
    orderId: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification