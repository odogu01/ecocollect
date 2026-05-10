import express from 'express'
import { body, param } from 'express-validator'
import TrashCan from '../models/TrashCan.js'
import Subscription from '../models/Subscription.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { isDriver, isCompany, isAdmin } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   GET /api/trashcans/deliveries
// @desc    Get trash cans pending delivery (for drivers)
// @access  Private (Driver)
router.get('/deliveries', protect, isDriver, async (req, res) => {
  try {
    // Get assigned trash cans that need delivery
    const trashCans = await TrashCan.find({
      $or: [
        { assignedDriver: req.user._id },
        { status: 'pending' }
      ],
      status: { $in: ['pending', 'assigned', 'out_for_delivery'] }
    })
      .populate('user', 'name email phone address')
      .populate('subscription')
      .sort({ createdAt: 1 })

    res.json({
      success: true,
      trashCans
    })
  } catch (error) {
    console.error('Get deliveries error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting deliveries'
    })
  }
})

// @route   GET /api/trashcans/all
// @desc    Get all trash cans (for company/admin)
// @access  Private (Company, Admin)
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const { status, driverId } = req.query

    let filter = {}
    if (status) filter.status = status
    if (driverId) filter.assignedDriver = driverId

    const trashCans = await TrashCan.find(filter)
      .populate('user', 'name email phone address')
      .populate('subscription')
      .populate('assignedDriver', 'name phone')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      trashCans
    })
  } catch (error) {
    console.error('Get all trash cans error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting trash cans'
    })
  }
})

// @route   POST /api/trashcans/assign
// @desc    Assign a driver to deliver trash cans
// @access  Private (Company, Admin)
router.post('/assign', protect, [
  body('trashCanIds').isArray({ min: 1 }).withMessage('At least one trash can ID is required'),
  body('driverId').isMongoId().withMessage('Valid driver ID is required')
], validate, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const { trashCanIds, driverId } = req.body

    // Verify driver exists and is a driver
    const driver = await User.findOne({ _id: driverId, role: 'driver' })
    if (!driver) {
      return res.status(400).json({
        success: false,
        message: 'Invalid driver'
      })
    }

    // Update trash cans
    const trashCans = await TrashCan.updateMany(
      { _id: { $in: trashCanIds }, status: 'pending' },
      {
        assignedDriver: driverId,
        status: 'assigned',
        assignedAt: new Date()
      }
      // Note: Use { $in: trashCanIds.map(id => new mongoose.Types.ObjectId(id)) } for proper ObjectId handling
    )

    // Get updated trash cans
    const updatedCans = await TrashCan.find({ _id: { $in: trashCanIds } })
      .populate('user', 'name email phone address')

    res.json({
      success: true,
      message: `Assigned ${updatedCans.length} trash can(s) to driver`,
      trashCans: updatedCans
    })
  } catch (error) {
    console.error('Assign driver error:', error)
    res.status(500).json({
      success: false,
      message: 'Error assigning driver'
    })
  }
})

// @route   PUT /api/trashcans/:id/status
// @desc    Update trash can delivery status
// @access  Private (Driver)
router.put('/:id/status', protect, isDriver, [
  param('id').isMongoId().withMessage('Invalid trash can ID'),
  body('status').isIn(['out_for_delivery', 'delivered']).withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const { status } = req.body

    const trashCan = await TrashCan.findById(req.params.id)
    if (!trashCan) {
      return res.status(404).json({
        success: false,
        message: 'Trash can not found'
      })
    }

    // Driver can only update their assigned cans
    if (trashCan.assignedDriver?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this delivery'
      })
    }

    // Update status
    trashCan.status = status
    if (status === 'delivered') {
      trashCan.deliveredAt = new Date()
    }

    await trashCan.save()

    // Update user's delivered trash cans count
    if (status === 'delivered') {
      await User.findByIdAndUpdate(trashCan.user, {
        $inc: { trashCansDelivered: 1 }
      })
    }

    res.json({
      success: true,
      message: `Trash can marked as ${status}`,
      trashCan
    })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    })
  }
})

// @route   PUT /api/trashcans/:id/deliver
// @desc    Mark trash can as delivered with address confirmation
// @access  Private (Driver)
router.put('/:id/deliver', protect, isDriver, [
  param('id').isMongoId().withMessage('Invalid trash can ID'),
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required')
], validate, async (req, res) => {
  try {
    const { deliveryAddress, notes } = req.body

    const trashCan = await TrashCan.findById(req.params.id)
    if (!trashCan) {
      return res.status(404).json({
        success: false,
        message: 'Trash can not found'
      })
    }

    if (trashCan.assignedDriver?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not assigned to this delivery'
      })
    }

    trashCan.status = 'delivered'
    trashCan.deliveredAt = new Date()
    trashCan.deliveryAddress = deliveryAddress
    if (notes) trashCan.notes = notes

    await trashCan.save()

    // Update user's delivered count
    await User.findByIdAndUpdate(trashCan.user, {
      $inc: { trashCansDelivered: 1 }
    })

    // Check if both cans are delivered for this user
    const otherCan = await TrashCan.findOne({
      user: trashCan.user,
      canNumber: trashCan.canNumber === 1 ? 2 : 1,
      status: 'delivered'
    })

    const message = otherCan
      ? 'Trash can delivered! Both trash cans have been delivered to the customer.'
      : 'Trash can delivered! One more trash can remaining for this customer.'

    res.json({
      success: true,
      message,
      trashCan
    })
  } catch (error) {
    console.error('Deliver trash can error:', error)
    res.status(500).json({
      success: false,
      message: 'Error delivering trash can'
    })
  }
})

// @route   GET /api/trashcans/my-deliveries
// @desc    Get driver's current deliveries stats
// @access  Private (Driver)
router.get('/my-deliveries', protect, isDriver, async (req, res) => {
  try {
    const pending = await TrashCan.countDocuments({
      assignedDriver: req.user._id,
      status: { $in: ['pending', 'assigned'] }
    })

    const outForDelivery = await TrashCan.countDocuments({
      assignedDriver: req.user._id,
      status: 'out_for_delivery'
    })

    const delivered = await TrashCan.countDocuments({
      assignedDriver: req.user._id,
      status: 'delivered'
    })

    const trashCans = await TrashCan.find({
      assignedDriver: req.user._id,
      status: { $in: ['assigned', 'out_for_delivery'] }
    })
      .populate('user', 'name email phone address')
      .sort({ assignedAt: -1 })

    res.json({
      success: true,
      stats: {
        pending,
        outForDelivery,
        delivered,
        total: pending + outForDelivery + delivered
      },
      trashCans
    })
  } catch (error) {
    console.error('Get my deliveries error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting delivery stats'
    })
  }
})

// @route   POST /api/trashcans/auto-assign
// @desc    Auto-assign pending trash cans to available drivers
// @access  Private (Company, Admin)
router.post('/auto-assign', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Get all pending trash cans
    const pendingCans = await TrashCan.find({ status: 'pending' })

    if (pendingCans.length === 0) {
      return res.json({
        success: true,
        message: 'No pending trash cans to assign',
        assigned: 0
      })
    }

    // Get available drivers (simple round-robin)
    const drivers = await User.find({ role: 'driver', isActive: true })

    if (drivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available drivers'
      })
    }

    // Distribute trash cans among drivers
    let assigned = 0
    for (let i = 0; i < pendingCans.length; i++) {
      const driverIndex = i % drivers.length
      pendingCans[i].assignedDriver = drivers[driverIndex]._id
      pendingCans[i].status = 'assigned'
      pendingCans[i].assignedAt = new Date()
      await pendingCans[i].save()
      assigned++
    }

    res.json({
      success: true,
      message: `Assigned ${assigned} trash can(s) to drivers`,
      assigned
    })
  } catch (error) {
    console.error('Auto assign error:', error)
    res.status(500).json({
      success: false,
      message: 'Error auto-assigning trash cans'
    })
  }
})

export default router