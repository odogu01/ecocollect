const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: '💡',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✅',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: '⚠️',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '❌',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    }
  }

  const { bg, border, icon, titleColor, messageColor } = types[type]

  return (
    <div className={`
      ${bg} ${border} border rounded-xl p-4 flex items-start gap-3
      animate-fade-in ${className}
    `}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        {title && (
          <h4 className={`font-medium ${titleColor}`}>{title}</h4>
        )}
        {message && (
          <p className={`text-sm ${messageColor} ${title ? 'mt-1' : ''}`}>{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  )
}

export default Alert