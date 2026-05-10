import express from 'express'
import Stripe from 'stripe'
import Pickup from '../models/Pickup.js'
import Payment from '../models/Payment.js'
import Notification from '../models/Notification.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { param, body } from 'express-validator'

const router = express.Router()

// Initialize Stripe (use test key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

// @route   POST /api/payments/create-intent/:pickupId
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent/:pickupId', protect, [
  param('pickupId').isMongoId().withMessage('Invalid pickup ID')
], validate, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.pickupId)
      .populate('category', 'name')

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    // Check ownership
    if (pickup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Check if already paid
    if (pickup.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Pickup is already paid'
      })
    }

    // Check if price is valid
    if (pickup.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No payment required for this pickup'
      })
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pickup.price * 100), // Convert to kobo (Stripe uses smallest currency unit)
      currency: 'ngn',
      metadata: {
        pickupId: pickup._id.toString(),
        userId: req.user._id.toString()
      },
      description: `Waste Pickup - ${pickup.category?.name} - ${pickup.address}`
    })

    // Save payment intent ID to pickup
    pickup.stripePaymentIntentId = paymentIntent.id
    await pickup.save()

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      pickup
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating payment'
    })
  }
})

// @route   POST /api/payments/confirm/:pickupId
// @desc    Confirm payment (called from webhook or after success)
// @access  Private
router.post('/confirm/:pickupId', protect, [
  param('pickupId').isMongoId().withMessage('Invalid pickup ID'),
  body('paymentId').notEmpty().withMessage('Payment ID is required')
], validate, async (req, res) => {
  try {
    const { paymentId } = req.body

    const pickup = await Pickup.findById(req.params.pickupId)
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      })
    }

    // Update pickup
    pickup.paymentStatus = 'paid'
    pickup.paymentId = paymentId
    await pickup.save()

    // Create payment record
    await Payment.create({
      user: req.user._id,
      pickup: pickup._id,
      amount: pickup.price,
      stripePaymentIntentId: paymentId,
      status: 'succeeded'
    })

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: 'payment',
      title: 'Payment Successful',
      message: `Payment of $${pickup.price} for your pickup has been confirmed.`,
      data: { pickupId: pickup._id, orderId: paymentId }
    })

    // Emit socket event
    const io = req.app.get('io')
    io.emit('payment-confirmed', { 
      pickupId: pickup._id,
      userId: req.user._id
    })

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      pickup
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    })
  }
})

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'pickup',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Payment.countDocuments({ user: req.user._id })

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get payment history error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   GET /api/payments/pickup/:pickupId
// @desc    Get payment for a specific pickup
// @access  Private
router.get('/pickup/:pickupId', protect, [
  param('pickupId').isMongoId().withMessage('Invalid pickup ID')
], validate, async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.pickupId)
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      })
    }

    // Check ownership
    if (pickup.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const payment = await Payment.findOne({ pickup: pickup._id })

    res.json({
      success: true,
      payment,
      pickup
    })
  } catch (error) {
    console.error('Get pickup payment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (Stripe calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const { pickupId } = paymentIntent.metadata

    if (pickupId) {
      // Update pickup payment status
      const pickup = await Pickup.findById(pickupId)
      if (pickup) {
        pickup.paymentStatus = 'paid'
        pickup.paymentId = paymentIntent.id
        await pickup.save()

        // Create payment record
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            user: pickup.user,
            pickup: pickup._id,
            amount: pickup.price,
            status: 'succeeded'
          },
          { upsert: true }
        )
      }
    }
  }

  res.json({ received: true })
})

export default router