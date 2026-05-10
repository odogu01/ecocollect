import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import WasteCategory from '../models/WasteCategory.js'
import Pickup from '../models/Pickup.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-pickup'

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await WasteCategory.deleteMany({})
    await Pickup.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create waste categories
    const categories = await WasteCategory.insertMany([
      {
        name: 'Plastic',
        description: 'Plastic bottles, containers, packaging materials',
        price: 0.50,
        unit: 'per kg',
        isRecyclable: true,
        icon: '♻️',
        sortOrder: 1
      },
      {
        name: 'Metal',
        description: 'Aluminum cans, metal containers, scrap metal',
        price: 1.00,
        unit: 'per kg',
        isRecyclable: true,
        icon: '🔩',
        sortOrder: 2
      },
      {
        name: 'E-waste',
        description: 'Old electronics, batteries, devices',
        price: 2.00,
        unit: 'per item',
        isRecyclable: true,
        icon: '📱',
        sortOrder: 3
      },
      {
        name: 'General',
        description: 'Mixed household waste',
        price: 0.25,
        unit: 'per kg',
        isRecyclable: false,
        icon: '🗑️',
        sortOrder: 4
      },
      {
        name: 'Organic',
        description: 'Food waste, garden clippings, biodegradable materials',
        price: 0,
        unit: 'per kg',
        isRecyclable: true,
        icon: '🌱',
        sortOrder: 5
      },
      {
        name: 'Paper',
        description: 'Newspapers, cardboard, paper products',
        price: 0.30,
        unit: 'per kg',
        isRecyclable: true,
        icon: '📰',
        sortOrder: 6
      },
      {
        name: 'Glass',
        description: 'Glass bottles, jars, broken glass',
        price: 0.20,
        unit: 'per kg',
        isRecyclable: true,
        icon: '🫙',
        sortOrder: 7
      },
      {
        name: 'Textile',
        description: 'Old clothes, fabric, linens',
        price: 0.15,
        unit: 'per kg',
        isRecyclable: true,
        icon: '👕',
        sortOrder: 8
      }
    ])
    console.log('✅ Created waste categories')

    // Create test users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@ecocollect.com',
        password: 'admin123',
        phone: '+1234567890',
        role: 'admin',
        address: '123 Admin Street, Admin City',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Eco Company',
        email: 'company@ecocollect.com',
        password: 'company123',
        phone: '+1234567891',
        role: 'company',
        companyName: 'Eco Solutions Inc.',
        address: '456 Business Ave, Commerce City',
        isApproved: true,
        isActive: true
      },
      {
        name: 'John Driver',
        email: 'driver@ecocollect.com',
        password: 'driver123',
        phone: '+1234567892',
        role: 'driver',
        address: '789 Driver Lane, Transport Town',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Jane Resident',
        email: 'user@example.com',
        password: 'user123',
        phone: '+1234567893',
        role: 'resident',
        address: '321 Home Street, Residential Area',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Second Driver',
        email: 'driver2@ecocollect.com',
        password: 'driver123',
        phone: '+1234567894',
        role: 'driver',
        address: '654 Transport Street, Logistics City',
        isApproved: true,
        isActive: true
      }
    ])
    console.log('✅ Created test users')

    // Create some sample pickups
    const plasticCategory = categories.find(c => c.name === 'Plastic')
    const metalCategory = categories.find(c => c.name === 'Metal')
    const organicCategory = categories.find(c => c.name === 'Organic')
    const eWasteCategory = categories.find(c => c.name === 'E-waste')

    const residentUser = users.find(u => u.role === 'resident')
    const driverUser = users.find(u => u.role === 'driver')

    const pickups = await Pickup.insertMany([
      {
        user: residentUser._id,
        category: plasticCategory._id,
        address: '321 Home Street, Residential Area',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'pending',
        estimatedWeight: 2,
        price: 1.00,
        paymentStatus: 'paid'
      },
      {
        user: residentUser._id,
        category: metalCategory._id,
        address: '321 Home Street, Residential Area',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'completed',
        estimatedWeight: 1.5,
        price: 1.50,
        paymentStatus: 'paid',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: residentUser._id,
        category: organicCategory._id,
        address: '321 Home Street, Residential Area',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        status: 'assigned',
        estimatedWeight: 3,
        price: 0,
        driver: driverUser._id,
        paymentStatus: 'paid'
      },
      {
        user: residentUser._id,
        category: eWasteCategory._id,
        address: '321 Home Street, Residential Area',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending',
        estimatedWeight: 1,
        price: 2.00,
        paymentStatus: 'pending'
      }
    ])
    console.log('✅ Created sample pickups')

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📋 Demo Accounts:')
    console.log('   Admin:   admin@ecocollect.com / admin123')
    console.log('   Company: company@ecocollect.com / company123')
    console.log('   Driver:  driver@ecocollect.com / driver123')
    console.log('   Resident: user@example.com / user123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seedData()