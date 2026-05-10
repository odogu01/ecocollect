import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['resident', 'company', 'driver', 'admin'],
    default: 'resident'
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    enum: [
      'Ada-George', 'Aluu', 'Amadi-Ama', 'Bori', 'Choba', 'D-Line', 'Dakata',
      'Elekahia', 'Elelenwo', 'Eliopoly', 'Elito', 'Eneka', 'Iwofe', 'Kaa',
      'Ketu', 'MGbada', 'Milling Plant', 'Nego', 'New GRA', 'Nkpolu',
      'Obu-Obele', 'Ogbunike', 'Oginigba', 'Oi', 'Okporowo', 'Omagwa',
      'Omoku', 'Orji', 'Oyigbo', 'Pirri', 'Rumuaghaolu', 'Rumuaghaolu',
      'Rumuakpani', 'Rumuibekwe', 'Rumuigbo', 'Rumuita', 'Rumuodumaya',
      'Rumuokwachi', 'Rumuola', 'Rumuoside', 'Rumu-pi', 'Rumu-ti', 'Sugar',
      'Tombia', 'Trans-Amadi', 'Woji', 'YKC', 'Other'
    ]
  },
  companyName: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  // Subscription fields
  hasActiveSubscription: {
    type: Boolean,
    default: false
  },
  subscriptionStartDate: {
    type: Date
  },
  subscriptionEndDate: {
    type: Date
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  trashCansAssigned: {
    type: Number,
    default: 0
  },
  trashCansDelivered: {
    type: Number,
    default: 0
  },
  isNewUser: {
    type: Boolean,
    default: true // Tracks if user is new and eligible for discount
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get public profile (exclude sensitive fields)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    address: this.address,
    city: this.city,
    companyName: this.companyName,
    isApproved: this.isApproved,
    profileImage: this.profileImage,
    hasActiveSubscription: this.hasActiveSubscription,
    trashCansAssigned: this.trashCansAssigned
  }
}

const User = mongoose.model('User', userSchema)

export default User