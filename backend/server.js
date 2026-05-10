import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import pickupRoutes from './routes/pickups.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payments.js'
import notificationRoutes from './routes/notifications.js'
import subscriptionRoutes from './routes/subscriptions.js'
import pricingRoutes from './routes/pricing.js'
import trashCanRoutes from './routes/trashcans.js'

// Import Socket handlers
import { setupSocketHandlers } from './sockets/index.js'

// Load env vars
dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      // In production, replace with your actual Vercel domain
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL
      ].filter(Boolean)
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Make io accessible to routes
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pickups', pickupRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/pricing', pricingRoutes)
app.use('/api/trashcans', trashCanRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Socket.io setup
setupSocketHandlers(io)

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-pickup'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message)
})

export default app