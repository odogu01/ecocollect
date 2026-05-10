import LoadingSpinner from './LoadingSpinner'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02]',
    secondary: 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-xl',
    ghost: 'text-gray-600 hover:bg-gray-100',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl'
  }

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" text="" />
      ) : (
        <>
          {icon && <span className="text-lg">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

export default Button