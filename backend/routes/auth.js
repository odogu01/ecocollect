import express from 'express'
import { body } from 'express-validator'
import User from '../models/User.js'
import { protect, generateToken } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('city').trim().notEmpty().withMessage('Location is required'),
  body('address').optional().trim()
], validate, async (req, res) => {
  try {
    console.log('Registration request:', req.body)
    const { name, email, password, phone, address, city } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create user (only resident role for public registration)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'resident',
      address: address || '',
      city,
      isApproved: true
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user with password
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      })
    }

    // Check if user is approved (for company/driver)
    if (!user.isApproved && (user.role === 'company' || user.role === 'driver')) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval'
      })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({
      success: true,
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().trim()
], validate, async (req, res) => {
  try {
    const { name, phone, address, companyName, notificationPreferences } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (companyName !== undefined) updateData.companyName = companyName
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router