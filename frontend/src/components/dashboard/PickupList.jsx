import { Link } from 'react-router-dom'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { Badge } from '../common'

const PickupCard = ({ pickup, onStatusChange, showActions = false, isDriver = false }) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-5 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
            🗑️
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Pickup #{pickup._id?.slice(-6)}</h4>
            <p className="text-sm text-gray-500">Waste Collection</p>
          </div>
        </div>
        <span className={`status-badge ${getStatusColor(pickup.status)}`}>
          {getStatusLabel(pickup.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span>
          <span className="truncate">{pickup.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📅</span>
          <span>{formatDate(pickup.scheduledDate, 'MMM dd, yyyy - h:mm a')}</span>
        </div>
        {pickup.driver && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🚚</span>
            <span>{pickup.driver.name}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {pickup.status === 'assigned' && isDriver && (
            <button
              onClick={() => onStatusChange?.(pickup._id, 'picked')}
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              Mark as Picked
            </button>
          )}
          {pickup.status === 'picked' && isDriver && (
            <button
              onClick={() => onStatusChange?.(pickup._id, 'completed')}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Mark as Completed
            </button>
          )}
          {pickup.status === 'pending' && !isDriver && (
            <Link
              to={`/track-pickup/${pickup._id}`}
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-primary-600 transition-colors text-center"
            >
              View Details
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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-12 text-center">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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