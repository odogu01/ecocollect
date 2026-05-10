import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const newSocket = io(backendUrl, {
        auth: {
          token: user.token || localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50))
      })

      newSocket.on('pickup-update', (data) => {
        setNotifications(prev => [{
          type: 'pickup',
          message: `Pickup #${data.pickupId} status changed to ${data.status}`,
          timestamp: new Date()
        }, ...prev].slice(0, 50))
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else if (socket) {
      socket.close()
      setSocket(null)
      setConnected(false)
    }
  }, [isAuthenticated, user?.token])

  const emitPickupUpdate = useCallback((pickupId, status) => {
    if (socket && connected) {
      socket.emit('pickup-update', { pickupId, status })
    }
  }, [socket, connected])

  const joinRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('join-room', room)
    }
  }, [socket, connected])

  const leaveRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('leave-room', room)
    }
  }, [socket, connected])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = {
    socket,
    connected,
    notifications,
    emitPickupUpdate,
    joinRoom,
    leaveRoom,
    clearNotifications
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketContext