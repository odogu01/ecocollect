import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

/**
 * Format date for display
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

/**
 * Format date with relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'h:mm a')}`
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get status color class
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'status-pending',
    assigned: 'status-assigned',
    picked: 'status-picked',
    completed: 'status-completed'
  }
  return colors[status?.toLowerCase()] || 'status-pending'
}

/**
 * Get status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    picked: 'Picked Up',
    completed: 'Completed'
  }
  return labels[status?.toLowerCase()] || status
}

/**
 * Get waste category icon
 */
export const getCategoryIcon = (category) => {
  const icons = {
    plastic: '♻️',
    metal: '🔩',
    general: '🗑️',
    'e-waste': '📱',
    organic: '🌱'
  }
  return icons[category?.toLowerCase()] || '🗑️'
}

/**
 * Get role display name
 */
export const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    company: 'Company',
    driver: 'Driver',
    resident: 'Resident'
  }
  return labels[role] || role
}

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-+()]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Generate pagination info
 */
export const getPaginationInfo = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  
  return {
    page,
    limit,
    total,
    totalPages,
    start,
    end,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  }
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Truncate text
 */
export const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}