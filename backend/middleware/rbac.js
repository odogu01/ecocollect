// Role-based access control middleware

// Check if user has required role(s)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      })
    }

    next()
  }
}

// Convenience middleware for each role
export const isAdmin = authorize('admin')
export const isCompany = authorize('company')
export const isDriver = authorize('driver')
export const isResident = authorize('resident')
export const isAdminOrCompany = authorize('admin', 'company')
export const isAdminOrDriver = authorize('admin', 'driver')
export const isAdminCompanyOrDriver = authorize('admin', 'company', 'driver')

// Check if user owns the resource or is admin
export const checkOwnership = (userField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      })
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next()
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userField] || req.body[userField]
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      })
    }

    next()
  }
}