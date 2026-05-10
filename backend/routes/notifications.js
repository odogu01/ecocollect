import express from 'express'
import Notification from '../models/Notification.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { param } from 'express-validator'

const router = express.Router()

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query
    const skip = (page - 1) * limit

    let filter = { user: req.user._id }
    if (unread === 'true') filter.isRead = false

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    })

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, [
  param('id').isMongoId().withMessage('Invalid notification ID')
], validate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid notification ID')
], validate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      })
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router