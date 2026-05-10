import { validationResult } from 'express-validator'

// Validate request using express-validator
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }

  next()
}

// Common validation rules
export const validationRules = {
  // User validations
  user: {
    name: (value) => {
      if (!value || value.trim().length < 2) {
        throw new Error('Name must be at least 2 characters')
      }
      if (value.trim().length > 50) {
        throw new Error('Name cannot exceed 50 characters')
      }
      return true
    },
    email: (value) => {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(value)) {
        throw new Error('Please enter a valid email')
      }
      return true
    },
    password: (value) => {
      if (!value || value.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      return true
    },
    phone: (value) => {
      if (!value || value.trim().length < 10) {
        throw new Error('Please enter a valid phone number')
      }
      return true
    }
  },

  // Pickup validations
  pickup: {
    address: (value) => {
      if (!value || value.trim().length < 5) {
        throw new Error('Please enter a valid address')
      }
      return true
    },
    scheduledDate: (value) => {
      if (!value) {
        throw new Error('Scheduled date is required')
      }
      const date = new Date(value)
      if (date < new Date()) {
        throw new Error('Scheduled date must be in the future')
      }
      return true
    },
    weight: (value) => {
      const weight = parseFloat(value)
      if (isNaN(weight) || weight < 0.1) {
        throw new Error('Weight must be at least 0.1 kg')
      }
      return true
    }
  },

  // Category validations
  category: {
    name: (value) => {
      if (!value || value.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters')
      }
      return true
    },
    price: (value) => {
      const price = parseFloat(value)
      if (isNaN(price) || price < 0) {
        throw new Error('Price must be a positive number')
      }
      return true
    }
  }
}