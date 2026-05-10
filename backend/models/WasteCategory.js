import mongoose from 'mongoose'

const wasteCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    enum: ['Plastic', 'Metal', 'General', 'E-waste', 'Organic', 'Paper', 'Glass', 'Textile']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    default: 'per kg'
  },
  isRecyclable: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: '♻️'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for faster queries (name already has index from unique: true)
wasteCategorySchema.index({ isActive: 1 })

const WasteCategory = mongoose.model('WasteCategory', wasteCategorySchema)

export default WasteCategory