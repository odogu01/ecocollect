import User from '../models/User.js'
import Subscription from '../models/Subscription.js'

// Check if user has an active subscription
export const requireSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'resident') {
      // Non-residents don't need subscription
      return next()
    }

    const user = await User.findById(req.user._id)

    if (!user.hasActiveSubscription) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required. Please subscribe to continue.',
        code: 'SUBSCRIPTION_REQUIRED'
      })
    }

    // Check if subscription has expired
    if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
      // Mark as expired
      user.hasActiveSubscription = false
      await user.save()

      await Subscription.findByIdAndUpdate(user.subscriptionId, {
        status: 'expired'
      })

      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED'
      })
    }

    req.user.hasActiveSubscription = true
    next()
  } catch (error) {
    console.error('Subscription check error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription'
    })
  }
}

// Optional - Attach subscription info to request but don't block
export const attachSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'resident') {
      return next()
    }

    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active'
    })

    req.user.subscription = subscription
    next()
  } catch (error) {
    console.error('Attach subscription error:', error)
    next()
  }
}