import express from 'express'
import { body, param, query } from 'express-validator'
import Pickup from '../models/Pickup.js'
import Notification from '../models/Notification.js'
import { protect, generateToken } from '../middleware/auth.js'
import { isAdmin, isCompany, isDriver, isAdminOrCompany, isAdminOrDriver } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   POST /api/pickups
// @desc    Create a new pickup request (for subscription-based service)
// @access  Private (Resident, Company)
router.post('/', protect, [
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('notes').optional().trim()
], validate, async (req, res) => {
  try {
    const { address, scheduledDate, notes } = req.body

    // Create pickup (price is 0 for subscription-based)
    const pickup = await Pickup.create({
      user: req.user._id,
      address,
      scheduledDate,
      notes,
      estimatedWeight: 1,
      price: 0,
      paymentStatus: 'paid' // Subscription covers the pickup
    })

    await pickup.populate('user', 'name email phone')

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: 'pickup',
      title: 'Pickup Request Created',
      message: 'Your pickup request has been scheduled.',
      data: { pickupId: pickup._id }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.emit('pickup-created', { pickup })

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      pickup
    })
  } catch (error) {
    console.error('Create pickup error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating pickup'
    })
  }
})

// @route   GET /api/pickups
// @desc    Get all pickups (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query
    const skip = (page - 1) * limit

    let filter = {}

    // Filter based on role
    if (req.user.role === 'resident') {
      filter.user = req.user._id
    } else if (req.user.role === 'driver') {
      filter.driver = req.user._id
    } else if (req.user.role === 'company') {
      // Company sees all pickups
    }

    // Additional filters
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.scheduledDate = {}
      if (startDate) filter.scheduledDate.$gte = new Date(startDate)
      if (endDate) filter.scheduledDate.$lte = new Date(endDate)
    }

    const pickups = await Pickup.find(filter)
      .populate('user', 'name email phone address city')
      .populate('driver', 'name phone')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Pickup.countDocuments(filter)

    res.json({
      success: true,
      pickups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get pickups error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/pickups/my-pickups
// @desc    Get current user's pickups
// @access  Private
router.get('/my-pickups', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const skip = (page - 1) * limit

    let filter = { user: req.user._id }
    if (status) filter.status = status

    const pickups = await Pickup.find(filter)
      .populate('user', 'name email phone address city')
      .populate('user', 'name email phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Pickup.countDocuments(filter)

    res.json({
      success: true,
      pickups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get my pickups error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/pickups/stats
// @desc    Get pickup statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let userFilter = {}
    if (req.user.role === 'resident') {
      userFilter.user = req.user._id
    } else if (req.user.role === 'driver') {
      userFilter.driver = req.user._id
    }

    const [
      totalPickups,
      pendingPickups,
      completedPickups,
      todayPickups,
      inProgressPickups
    ] = await Promise.all([
      Pickup.countDocuments(userFilter),
      Pickup.countDocuments({ ...userFilter, status: 'pending' }),
      Pickup.countDocuments({ ...userFilter, status: 'completed' }),
      Pickup.countDocuments({
        ...userFilter,
        scheduledDate: { $gte: today, $lt: tomorrow }
      }),
      Pickup.countDocuments({ ...userFilter, status: 'picked' })
    ])

    // Get revenue for residents
    let totalSpent = 0
    let revenue = 0
    if (req.user.role === 'resident') {
      const paidPickups = await Pickup.find({
        user: req.user._id,
        paymentStatus: 'paid'
      })
      totalSpent = paidPickups.reduce((sum, p) => sum + p.price, 0)
    }
    if (req.user.role === 'company' || req.user.role === 'admin') {
      const completedPaid = await Pickup.find({
        status: 'completed',
        paymentStatus: 'paid'
      })
      revenue = completedPaid.reduce((sum, p) => sum + p.price, 0)
    }

    // Get active drivers count (for company/admin)
    let activeDrivers = 0
    if (req.user.role === 'company' || req.user.role === 'admin') {
      activeDrivers = await Pickup.distinct('driver', { status: { $in: ['assigned', 'picked'] } }).length
    }

    res.json({
      success: true,
      stats: {
        totalPickups,
        pendingPickups,
        completedPickups,
        todayPickups,
        inProgressPickups,
        totalSpent: Math.round(totalSpent * 100) / 100,
        revenue: Math.round(revenue * 100) / 100,
        activeDrivers
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/pickups/:id
// @desc    Get pickup by ID
// @access  Private
router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid pickup ID')
], validate, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('user', 'name email phone address city')
      .populate('user', 'name email phone address')
      .populate('driver', 'name phone')

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    // Check authorization
    if (req.user.role === 'resident' && pickup.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this pickup'
      })
    }

    res.json({
      success: true,
      pickup
    })
  } catch (error) {
    console.error('Get pickup error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/pickups/:id/status
// @desc    Update pickup status
// @access  Private (Driver, Company, Admin)
router.put('/:id/status', protect, [
  param('id').isMongoId().withMessage('Invalid pickup ID'),
  body('status').isIn(['pending', 'assigned', 'picked', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const { status } = req.body

    const pickup = await Pickup.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('user', 'name email phone')
      .populate('driver', 'name phone')

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    // Check authorization based on role and status transition
    if (req.user.role === 'driver') {
      if (pickup.driver?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not assigned to this pickup'
        })
      }
      // Driver can only move forward: assigned -> picked -> completed
      const validTransitions = {
        assigned: ['picked'],
        picked: ['completed']
      }
      if (!validTransitions[pupup.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status transition'
        })
      }
    } else if (req.user.role === 'company') {
      // Company can assign or change status
      if (!['assigned', 'cancelled'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Company cannot set this status'
        })
      }
    }

    // Update status with timestamps
    const updateData = { status }
    if (status === 'assigned') updateData.assignedAt = new Date()
    if (status === 'picked') updateData.pickedAt = new Date()
    if (status === 'completed') {
      updateData.completedAt = new Date()
      // If pickup was free, mark as completed
      if (pickup.price === 0) updateData.paymentStatus = 'paid'
    }

    const updatedPickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email phone address city')
     .populate('user', 'name email phone')
     .populate('driver', 'name phone')

    // Create notification
    const notificationMessages = {
      assigned: `Your pickup has been assigned to a driver`,
      picked: `Your pickup has been collected`,
      completed: `Your pickup has been completed. Thank you for recycling!`,
      cancelled: `Your pickup request has been cancelled`
    }

    await Notification.create({
      user: pickup.user._id,
      type: 'status',
      title: `Pickup ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: notificationMessages[status] || `Pickup status updated to ${status}`,
      data: { pickupId: pickup._id }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.emit('pickup-update', { 
      pickupId: pickup._id, 
      status,
      userId: pickup.user._id
    })

    res.json({
      success: true,
      message: 'Pickup status updated',
      pickup: updatedPickup
    })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/pickups/:id/assign
// @desc    Assign driver to pickup
// @access  Private (Company, Admin)
router.put('/:id/assign', protect, [
  param('id').isMongoId().withMessage('Invalid pickup ID'),
  body('driverId').isMongoId().withMessage('Invalid driver ID')
], validate, async (req, res) => {
  try {
    const { driverId } = req.body

    const pickup = await Pickup.findById(req.params.id)
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    if (pickup.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign driver to pending pickups'
      })
    }

    // Check if payment is required and paid
    if (pickup.price > 0 && pickup.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment required before assignment'
      })
    }

    pickup.driver = driverId
    pickup.status = 'assigned'
    pickup.assignedAt = new Date()
    await pickup.save()

    const updatedPickup = await Pickup.findById(req.params.id)
      .populate('user', 'name email phone address city')
      .populate('user', 'name email phone')
      .populate('driver', 'name phone')

    // Create notification for driver
    await Notification.create({
      user: driverId,
      type: 'pickup',
      title: 'New Pickup Assignment',
      message: `You have been assigned a new pickup for collection`,
      data: { pickupId: pickup._id }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.to(`user:${driverId}`).emit('new-assignment', { pickup: updatedPickup })

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      pickup: updatedPickup
    })
  } catch (error) {
    console.error('Assign driver error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router