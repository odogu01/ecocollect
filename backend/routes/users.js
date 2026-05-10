import express from 'express'
import { body, param, query } from 'express-validator'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { protect, generateToken } from '../middleware/auth.js'
import { isAdmin } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'
import { PORTHARCOURT_LOCATIONS } from '../utils/locations.js'

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isApproved, city } = req.query
    const skip = (page - 1) * limit

    let filter = {}
    if (role) filter.role = role
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true'
    if (city) filter.city = city
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/drivers
// @desc    Get all drivers
// @access  Private (Admin, Company)
router.get('/drivers', protect, async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isApproved: true, isActive: true })
      .select('name email phone')

    res.json({
      success: true,
      drivers
    })
  } catch (error) {
    console.error('Get drivers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid user ID')
], validate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/', protect, isAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').isIn(['resident', 'company', 'driver', 'admin']).withMessage('Invalid role')
], validate, async (req, res) => {
  try {
    const { name, email, password, phone, role, address, companyName } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      address: address || '',
      companyName: companyName || '',
      isApproved: true
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['resident', 'company', 'driver', 'admin']),
  body('isApproved').optional().isBoolean(),
  body('isActive').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const { name, phone, role, address, companyName, isApproved, isActive } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (address !== undefined) updateData.address = address
    if (companyName !== undefined) updateData.companyName = companyName
    if (isApproved !== undefined) updateData.isApproved = isApproved
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/users/:id/approve
// @desc    Approve user (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid user ID')
], validate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.isApproved = true
    await user.save()

    res.json({
      success: true,
      message: 'User approved successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Approve user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, isAdmin, [
  param('id').isMongoId().withMessage('Invalid user ID')
], validate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    // Hard delete - actually remove from database
    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/locations
// @desc    Get all available locations
// @access  Public
router.get('/locations', async (req, res) => {
  try {
    res.json({
      success: true,
      locations: PORTHARCOURT_LOCATIONS
    })
  } catch (error) {
    console.error('Get locations error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/by-city/:city
// @desc    Get users grouped by city (for admin)
// @access  Private (Admin)
router.get('/by-city/:city', protect, isAdmin, async (req, res) => {
  try {
    const { city } = req.params
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const users = await User.find({ city, role: 'resident' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments({ city, role: 'resident' })

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users by city error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/users/cities
// @desc    Get cities with user counts (for admin dashboard)
// @access  Private (Admin)
router.get('/cities', protect, isAdmin, async (req, res) => {
  try {
    const cities = await User.aggregate([
      { $match: { role: 'resident', city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      cities: cities.map(c => ({ city: c._id, count: c.count }))
    })
  } catch (error) {
    console.error('Get cities error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/users/trashcan-alert
// @desc    Resident reports trash can is full
// @access  Private (Resident)
router.post('/trashcan-alert', protect, async (req, res) => {
  try {
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Only residents can report trash can status'
      })
    }

    const { trashCanId, message } = req.body

    // Create notification for admin
    await Notification.create({
      user: req.user._id, // This will be the resident
      type: 'trash_can_alert',
      title: 'Trash Can Full Alert',
      message: message || `${req.user.name} reported that their trash can is full and needs collection`,
      data: {
        trashCanId,
        residentName: req.user.name,
        residentCity: req.user.city,
        residentAddress: req.user.address
      },
      isForAdmin: true // Flag to indicate this is for admin
    })

    // Find admin users and notify them
    const admins = await User.find({ role: 'admin' })
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'trash_can_alert',
        title: 'Trash Can Full Alert',
        message: `${req.user.name} from ${req.user.city} reported that their trash can is full`,
        data: {
          trashCanId,
          residentId: req.user._id,
          residentName: req.user.name,
          residentCity: req.user.city,
          residentAddress: req.user.address
        }
      })
    }

    // Emit socket event
    const io = req.app.get('io')
    io.to('role:admin').emit('trash-can-alert', {
      residentId: req.user._id,
      residentName: req.user.name,
      city: req.user.city,
      address: req.user.address
    })

    res.json({
      success: true,
      message: 'Alert sent successfully. We will collect your trash soon!'
    })
  } catch (error) {
    console.error('Trash can alert error:', error)
    res.status(500).json({
      success: false,
      message: 'Error sending alert'
    })
  }
})

export default router