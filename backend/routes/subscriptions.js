import express from 'express'
import { body, param } from 'express-validator'
import Subscription from '../models/Subscription.js'
import TrashCan from '../models/TrashCan.js'
import Pricing from '../models/Pricing.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { isCompany, isAdmin } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   POST /api/subscriptions/create
// @desc    Create a new subscription for resident
// @access  Private (Resident only)
router.post('/create', protect, [
  body('durationMonths').isInt({ min: 1, max: 3 }).withMessage('Duration must be between 1 and 3 months'),
  body('discountCode').optional().trim()
], validate, async (req, res) => {
  try {
    // Only residents can create subscriptions
    if (req.user.role !== 'resident') {
      return res.status(403).json({
        success: false,
        message: 'Only residents can create subscriptions'
      })
    }

    // Check if user already has an active subscription
    const existingSub = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    })

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      })
    }

    const { durationMonths, discountCode } = req.body

    // Get current pricing
    const pricing = await Pricing.findOne({ isActive: true })
    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Pricing not configured. Please contact support.'
      })
    }

    // Get pricing or use default
    const monthlyPrice = pricing?.monthlyPrice || 5000

    // Calculate price
    let discount = 0

    // Apply new user discount if eligible
    if (req.user.isNewUser && pricing.newUserDiscount > 0) {
      discount = (monthlyPrice * pricing.newUserDiscount) / 100
    }

    // Apply discount code if provided
    if (discountCode && pricing.discountCode === discountCode.toUpperCase()) {
      const codeDiscount = (monthlyPrice * pricing.newUserDiscount) / 100
      if (codeDiscount > discount) {
        discount = codeDiscount
      }
    }

    // Apply multi-month discount
    if (durationMonths === 2 && pricing.discount2Months > 0) {
      const multiMonthDiscount = (monthlyPrice * pricing.discount2Months) / 100
      discount = Math.max(discount, multiMonthDiscount)
    } else if (durationMonths === 3 && pricing.discount3Months > 0) {
      const multiMonthDiscount = (monthlyPrice * pricing.discount3Months) / 100
      discount = Math.max(discount, multiMonthDiscount)
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      plan: 'monthly',
      durationMonths,
      startDate: new Date(),
      monthlyPrice,
      discount,
      discountCode: discountCode ? discountCode.toUpperCase() : null,
      finalPrice: (monthlyPrice * durationMonths) - discount,
      status: 'active',
      paymentStatus: 'pending',
      trashCansAssigned: 2,
      isFirstSubscription: req.user.isNewUser
    })

    // Update user subscription info
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: true,
      subscriptionStartDate: subscription.startDate,
      subscriptionEndDate: subscription.endDate,
      subscriptionId: subscription._id,
      trashCansAssigned: 2,
      trashCansDelivered: 0,
      isNewUser: false // No longer a new user after subscribing
    })

    // Create trash cans for the user
    await TrashCan.create([
      {
        user: req.user._id,
        subscription: subscription._id,
        canNumber: 1,
        canType: 'general',
        status: 'pending'
      },
      {
        user: req.user._id,
        subscription: subscription._id,
        canNumber: 2,
        canType: 'recyclable',
        status: 'pending'
      }
    ])

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully! 2 trash cans have been assigned to you.',
      subscription: {
        _id: subscription._id,
        plan: subscription.plan,
        durationMonths: subscription.durationMonths,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        monthlyPrice: subscription.monthlyPrice,
        totalPrice: subscription.totalPrice,
        discount: subscription.discount,
        finalPrice: subscription.finalPrice,
        trashCansAssigned: subscription.trashCansAssigned,
        status: subscription.status
      }
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    })
  }
})

// @route   POST /api/subscriptions/payment
// @desc    Process payment for subscription
// @access  Private (Resident)
router.post('/payment', protect, [
  body('subscriptionId').isMongoId().withMessage('Invalid subscription ID')
], validate, async (req, res) => {
  try {
    const { subscriptionId } = req.body

    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      })
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // For now, mark as paid (in production, integrate with Stripe)
    subscription.paymentStatus = 'paid'
    await subscription.save()

    res.json({
      success: true,
      message: 'Payment successful',
      subscription
    })
  } catch (error) {
    console.error('Payment error:', error)
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    })
  }
})

// @route   GET /api/subscriptions/my-subscription
// @desc    Get current user's subscription
// @access  Private
router.get('/my-subscription', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    }).populate('user', 'name email')

    if (!subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        subscription: null
      })
    }

    // Get trash cans
    const trashCans = await TrashCan.find({ user: req.user._id })

    res.json({
      success: true,
      hasSubscription: true,
      subscription: {
        ...subscription.toObject(),
        trashCans
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting subscription'
    })
  }
})

// @route   GET /api/subscriptions/verify
// @desc    Verify if user has active subscription
// @access  Private
router.get('/verify', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    })

    const isActive = subscription && new Date(subscription.endDate) > new Date()

    res.json({
      success: true,
      hasActiveSubscription: isActive,
      subscription: isActive ? {
        endDate: subscription.endDate,
        trashCansAssigned: subscription.trashCansAssigned
      } : null
    })
  } catch (error) {
    console.error('Verify subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error verifying subscription'
    })
  }
})

// @route   GET /api/subscriptions/pricing
// @desc    Get current pricing info (for residents)
// @access  Public
router.get('/pricing', async (req, res) => {
  try {
    const pricing = await Pricing.findOne({ isActive: true })

    if (!pricing) {
      return res.json({
        success: true,
        pricing: {
          monthlyPrice: 5000,
          newUserDiscount: 10,
          discount2Months: 5,
          discount3Months: 10
        }
      })
    }

    res.json({
      success: true,
      pricing: {
        monthlyPrice: pricing.monthlyPrice,
        currency: pricing.currency,
        newUserDiscount: pricing.newUserDiscount,
        discountCode: pricing.discountCode,
        discountDescription: pricing.discountDescription,
        discount2Months: pricing.discount2Months,
        discount3Months: pricing.discount3Months
      }
    })
  } catch (error) {
    console.error('Get pricing error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting pricing'
    })
  }
})

// @route   PUT /api/subscriptions/renew
// @desc    Renew/extend subscription
// @access  Private (Resident)
router.put('/renew', protect, [
  body('durationMonths').isInt({ min: 1, max: 3 }).withMessage('Duration must be between 1 and 3 months')
], validate, async (req, res) => {
  try {
    const { durationMonths } = req.body

    const existingSub = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    })

    if (!existingSub) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      })
    }

    // Get current pricing
    const pricing = await Pricing.findOne({ isActive: true })
    const monthlyPrice = pricing?.monthlyPrice || 5000

    // Extend the subscription
    const newEndDate = new Date(existingSub.endDate)
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths)

    // Calculate new price
    const additionalPrice = monthlyPrice * durationMonths
    let discount = 0

    // Apply multi-month discount for renewal
    if (durationMonths === 2 && pricing?.discount2Months > 0) {
      discount = (monthlyPrice * pricing.discount2Months) / 100
    } else if (durationMonths === 3 && pricing?.discount3Months > 0) {
      discount = (monthlyPrice * pricing.discount3Months) / 100
    }

    existingSub.durationMonths += durationMonths
    existingSub.endDate = newEndDate
    existingSub.monthlyPrice = monthlyPrice
    existingSub.totalPrice += (monthlyPrice * durationMonths) - discount
    existingSub.finalPrice += (monthlyPrice * durationMonths) - discount

    await existingSub.save()

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      subscriptionEndDate: newEndDate
    })

    res.json({
      success: true,
      message: `Subscription extended by ${durationMonths} month(s)`,
      subscription: existingSub
    })
  } catch (error) {
    console.error('Renew subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error renewing subscription'
    })
  }
})

// @route   POST /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private (Resident)
router.post('/cancel', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    })

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      })
    }

    subscription.status = 'cancelled'
    await subscription.save()

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      hasActiveSubscription: false
    })

    // Mark trash cans as retired
    await TrashCan.updateMany(
      { user: req.user._id },
      { status: 'retired' }
    )

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    })
  }
})

export default router