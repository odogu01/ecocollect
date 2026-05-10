export const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-amber-500 to-amber-600',
    success: 'from-green-500 to-green-600',
    danger: 'from-red-500 to-red-600'
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        <div className={`
          w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]}
          flex items-center justify-center text-2xl shadow-lg
        `}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export const MetricGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {children}
  </div>
)