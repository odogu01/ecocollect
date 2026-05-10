import express from 'express'
import { body } from 'express-validator'
import Pricing from '../models/Pricing.js'
import { protect } from '../middleware/auth.js'
import { isCompany, isAdmin } from '../middleware/rbac.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   GET /api/pricing
// @desc    Get current pricing (for company/admin)
// @access  Private (Company, Admin)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    let pricing = await Pricing.findOne({ isActive: true })

    if (!pricing) {
      // Create default pricing if not exists
      pricing = await Pricing.create({
        monthlyPrice: 5000,
        newUserDiscount: 10,
        discountCode: 'WELCOME10',
        discountDescription: 'Welcome discount for new users',
        discount2Months: 5,
        discount3Months: 10,
        isActive: true
      })
    }

    res.json({
      success: true,
      pricing
    })
  } catch (error) {
    console.error('Get pricing error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting pricing'
    })
  }
})

// @route   PUT /api/pricing
// @desc    Update pricing (company/admin only)
// @access  Private (Company, Admin)
router.put('/', protect, [
  body('monthlyPrice').isFloat({ min: 0 }).withMessage('Monthly price must be a positive number'),
  body('newUserDiscount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('discount2Months').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('discount3Months').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
], validate, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const {
      monthlyPrice,
      newUserDiscount,
      discountCode,
      discountDescription,
      discount2Months,
      discount3Months,
      isActive
    } = req.body

    let pricing = await Pricing.findOne({ isActive: true })

    if (pricing) {
      // Update existing pricing
      pricing.monthlyPrice = monthlyPrice !== undefined ? monthlyPrice : pricing.monthlyPrice
      pricing.newUserDiscount = newUserDiscount !== undefined ? newUserDiscount : pricing.newUserDiscount
      pricing.discountCode = discountCode !== undefined ? discountCode : pricing.discountCode
      pricing.discountDescription = discountDescription !== undefined ? discountDescription : pricing.discountDescription
      pricing.discount2Months = discount2Months !== undefined ? discount2Months : pricing.discount2Months
      pricing.discount3Months = discount3Months !== undefined ? discount3Months : pricing.discount3Months
      pricing.isActive = isActive !== undefined ? isActive : pricing.isActive
      pricing.updatedBy = req.user._id
      await pricing.save()
    } else {
      // Create new pricing
      pricing = await Pricing.create({
        monthlyPrice,
        newUserDiscount: newUserDiscount || 0,
        discountCode: discountCode || null,
        discountDescription: discountDescription || '',
        discount2Months: discount2Months || 0,
        discount3Months: discount3Months || 0,
        isActive: true,
        updatedBy: req.user._id
      })
    }

    res.json({
      success: true,
      message: 'Pricing updated successfully',
      pricing
    })
  } catch (error) {
    console.error('Update pricing error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating pricing'
    })
  }
})

// @route   POST /api/pricing/discount-code
// @desc    Create/update discount code for new users
// @access  Private (Company, Admin)
router.post('/discount-code', protect, [
  body('code').trim().notEmpty().withMessage('Discount code is required'),
  body('discountPercentage').isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
  body('description').optional().trim()
], validate, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    const { code, discountPercentage, description } = req.body

    let pricing = await Pricing.findOne({ isActive: true })

    if (!pricing) {
      pricing = await Pricing.create({
        monthlyPrice: 29.99,
        newUserDiscount: discountPercentage,
        discountCode: code.toUpperCase(),
        discountDescription: description || `New user discount: ${discountPercentage}% off`,
        isActive: true,
        updatedBy: req.user._id
      })
    } else {
      pricing.discountCode = code.toUpperCase()
      pricing.newUserDiscount = discountPercentage
      pricing.discountDescription = description || `New user discount: ${discountPercentage}% off`
      pricing.updatedBy = req.user._id
      await pricing.save()
    }

    res.json({
      success: true,
      message: `Discount code ${code.toUpperCase()} set to ${discountPercentage}% off`,
      pricing
    })
  } catch (error) {
    console.error('Set discount code error:', error)
    res.status(500).json({
      success: false,
      message: 'Error setting discount code'
    })
  }
})

// @route   GET /api/pricing/history
// @desc    Get pricing history (for audit)
// @access  Private (Company, Admin)
router.get('/history', protect, async (req, res) => {
  try {
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Since we're using single document, just return current with timestamp
    const pricing = await Pricing.findOne({ isActive: true })
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 })

    res.json({
      success: true,
      pricing,
      history: pricing ? [pricing] : []
    })
  } catch (error) {
    console.error('Get pricing history error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting pricing history'
    })
  }
})

export default router