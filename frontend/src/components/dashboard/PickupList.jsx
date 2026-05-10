import { Link } from 'react-router-dom'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { Badge } from '../common'

const PickupCard = ({ pickup, onStatusChange, showActions = false, isDriver = false }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/50 p-3 sm:p-5 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg sm:text-xl">
            🗑️
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">Pickup #{pickup._id?.slice(-6)}</h4>
            <p className="text-xs sm:text-sm text-gray-500">Waste Collection</p>
          </div>
        </div>
        <span className={`status-badge text-xs ${getStatusColor(pickup.status)}`}>
          {getStatusLabel(pickup.status)}
        </span>
      </div>

      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <span>📍</span>
          <span className="truncate">{pickup.address}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <span>📅</span>
          <span className="whitespace-nowrap">{formatDate(pickup.scheduledDate, 'MMM dd, yyyy - h:mm a')}</span>
        </div>
        {pickup.driver && (
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <span>🚚</span>
            <span className="truncate">{pickup.driver.name}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          {pickup.status === 'assigned' && isDriver && (
            <button
              onClick={() => onStatusChange?.(pickup._id, 'picked')}
              className="flex-1 bg-purple-500 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-purple-600 transition-colors"
            >
              Picked
            </button>
          )}
          {pickup.status === 'picked' && isDriver && (
            <button
              onClick={() => onStatusChange?.(pickup._id, 'completed')}
              className="flex-1 bg-green-500 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-green-600 transition-colors"
            >
              Complete
            </button>
          )}
          {pickup.status === 'pending' && !isDriver && (
            <Link
              to={`/track-pickup/${pickup._id}`}
              className="flex-1 bg-primary-500 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-primary-600 transition-colors text-center"
            >
              View
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

const PickupList = ({ pickups, emptyMessage = 'No pickups found', showActions = false, isDriver = false }) => {
  if (!pickups || pickups.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/50 p-6 sm:p-12 text-center">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📦</div>
        <p className="text-gray-500 text-sm sm:text-base">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      {pickups.map(pickup => (
        <PickupCard
          key={pickup._id}
          pickup={pickup}
          showActions={showActions}
          isDriver={isDriver}
        />
      ))}
    </div>
  )
}

export default PickupList