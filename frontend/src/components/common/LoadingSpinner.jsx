const LoadingSpinner = ({ fullScreen = false, size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}

export default LoadingSpinner