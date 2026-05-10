const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`
        bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50
        ${hover ? 'hover:shadow-xl transition-shadow duration-300 cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

export default Card