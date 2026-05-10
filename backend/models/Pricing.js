import mongoose from 'mongoose'

const pricingSchema = new mongoose.Schema({
  monthlyPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Discount for new users
  newUserDiscount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Percentage discount
  },
  discountCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  discountDescription: {
    type: String,
    default: ''
  },
  // Multi-month discounts
  discount2Months: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discount3Months: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Waste category prices (for pickups beyond subscription)
  wasteCategoryPrices: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteCategory'
    },
    price: {
      type: Number,
      default: 0
    }
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Only allow one pricing document
pricingSchema.pre('save', async function(next) {
  const count = await this.constructor.countDocuments()
  if (count >= 1 && this.isNew) {
    // Update existing instead of creating new
    const existing = await this.constructor.findOne()
    if (existing) {
      this._id = existing._id
      this.isNew = false
    }
  }
  this.updatedAt = new Date()
  next()
})

const Pricing = mongoose.model('Pricing', pricingSchema)

export default Pricing