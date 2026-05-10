# EcoCollect - Waste Pickup & Recycling Request System

A full-stack web application for waste pickup and recycling management built with React, Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication** - JWT-based auth with role-based access control (Admin, Company, Driver, Resident)
- 📦 **Pickup Management** - Create, track, and manage waste pickup requests
- 💳 **Payments** - Stripe integration for processing payments
- 📡 **Real-time Updates** - Socket.io for live status updates
- 📱 **Responsive Design** - Mobile-first UI with modern glassmorphism styling
- 📊 **Role-based Dashboards** - Different interfaces for each user role
- 🗑️ **Waste Categories** - Manage different types of recyclable waste
- 🔔 **Notifications** - Email and SMS notifications for status changes

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router
- Axios
- Socket.io-client
- Stripe Elements

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.io
- Stripe SDK

## Project Structure

```
waste-pickup-system/
├── backend/
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth & validation middleware
│   ├── sockets/          # Socket.io handlers
│   ├── seeds/           # Database seed script
│   ├── server.js         # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context
│   │   ├── services/    # API services
│   │   └── utils/       # Helper functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or yarn

## Installation & Setup

### 1. MongoDB Setup

Either:
- Install MongoDB locally and run `mongod`
- Use MongoDB Atlas (cloud) and get connection string

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created with defaults)
# Update MONGODB_URI if needed

# Start the server
npm run dev
# OR for production
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates:
- 8 waste categories
- 4 test users (admin, company, driver, resident)
- Sample pickup requests

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste-pickup
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecocollect.com | admin123 |
| Company | company@ecocollect.com | company123 |
| Driver | driver@ecocollect.com | driver123 |
| Resident | user@example.com | user123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Pickups
- `POST /api/pickups` - Create pickup
- `GET /api/pickups` - Get all pickups
- `GET /api/pickups/my-pickups` - Get user's pickups
- `GET /api/pickups/stats` - Get statistics
- `GET /api/pickups/:id` - Get pickup details
- `PUT /api/pickups/:id/status` - Update status
- `PUT /api/pickups/:id/assign` - Assign driver

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/drivers` - Get drivers
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id/approve` - Approve user (Admin)

### Payments
- `POST /api/payments/create-intent/:pickupId` - Create payment intent
- `POST /api/payments/confirm/:pickupId` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Running in Production

1. Update environment variables with secure values
2. Build frontend: `cd frontend && npm run build`
3. Start backend: `cd backend && npm start`
4. Optionally use Nginx as reverse proxy

## Stripe Testing

Use Stripe test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000000000009995

## License

MIT License