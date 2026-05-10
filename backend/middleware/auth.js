import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')

    // Get user from token
    const user = await User.findById(decoded.id)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }
}

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

// Optional auth - attach user if token exists but don't require it
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
      const user = await User.findById(decoded.id)
      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Token invalid but continue without user
    next()
  }
}