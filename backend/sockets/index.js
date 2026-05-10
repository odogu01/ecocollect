import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token
      
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret')
      const user = await User.findById(decoded.id)

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role})`)

    // Join user to their personal room
    socket.join(`user:${socket.user._id}`)

    // Join role-based room
    socket.join(`role:${socket.user.role}`)

    // Join company room if user is company or admin
    if (socket.user.role === 'company' || socket.user.role === 'admin') {
      socket.join('company-room')
    }

    // Handle joining specific rooms
    socket.on('join-room', (room) => {
      socket.join(room)
      console.log(`${socket.user.name} joined room: ${room}`)
    })

    socket.on('leave-room', (room) => {
      socket.leave(room)
      console.log(`${socket.user.name} left room: ${room}`)
    })

    // Handle pickup updates
    socket.on('pickup-update', (data) => {
      const { pickupId, status } = data
      
      // Emit to relevant users
      io.emit('pickup-update', { 
        pickupId, 
        status,
        updatedBy: socket.user._id
      })
    })

    // Handle driver location updates
    socket.on('driver-location', (data) => {
      const { pickupId, location } = data
      
      // Broadcast to the customer waiting for this pickup
      io.to(`pickup:${pickupId}`).emit('driver-location-update', {
        pickupId,
        location,
        driverId: socket.user._id
      })
    })

    // Handle typing indicators for real-time feedback
    socket.on('start-typing', (data) => {
      socket.broadcast.emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        ...data
      })
    })

    socket.on('stop-typing', (data) => {
      socket.broadcast.emit('user-stop-typing', {
        userId: socket.user._id,
        ...data
      })
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user.name} (${reason})`)
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  // Helper functions for emitting events
  return {
    // Emit to specific user
    emitToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, data)
    },

    // Emit to all users with specific role
    emitToRole: (role, event, data) => {
      io.to(`role:${role}`).emit(event, data)
    },

    // Emit to all connected clients
    emitToAll: (event, data) => {
      io.emit(event, data)
    },

    // Emit to company room
    emitToCompany: (event, data) => {
      io.to('company-room').emit(event, data)
    }
  }
}