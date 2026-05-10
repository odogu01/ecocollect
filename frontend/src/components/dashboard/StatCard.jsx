export const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-amber-500 to-amber-600',
    success: 'from-green-500 to-green-600',
    danger: 'from-red-500 to-red-600'
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors[color]}
          flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0
        `}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export const MetricGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
    {children}
  </div>
)