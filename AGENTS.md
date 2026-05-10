# EcoCollect - Agent Instructions

## Quick Start

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT with role-based access
- **Real-time**: Socket.io

## Important Notes

### Currency
- All prices are in **Naira (NGN)**, not USD
- Default monthly subscription: ₦5,000

### Subscription System (Key Concept)
- Residents MUST subscribe before using the app (1-3 months)
- Subscription includes 2 trash cans (1 general, 1 recyclable)
- Pickups are free with active subscription (no category-based pricing)
- Residents can report "trash can full" via dashboard button

### Locations
- All residents are grouped by Port Harcourt locations
- 45+ areas (Ada-George, D-Line, New GRA, Rumuigbo, Trans-Amadi, etc.)
- City is required during registration
- Admin can filter users by city

## User Roles
| Role | Access |
|------|--------|
| **Admin** | Users, Pickups, Pricing, Trash Can Deliveries |
| **Company** | Manage Pickups, Pricing, Assign Drivers |
| **Driver** | Assignments, Trash Can Deliveries |
| **Resident** | Subscribe, Request Pickup, My Pickups, Alert (trash full) |

## Key API Endpoints

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription (1-3 months)
- `GET /api/subscriptions/verify` - Check active subscription
- `GET /api/subscriptions/pricing` - Get current pricing

### Trash Cans
- `POST /api/users/trashcan-alert` - Resident reports full trash can
- `GET /api/trashcans/deliveries` - Driver's delivery queue
- `PUT /api/trashcans/:id/deliver` - Mark as delivered

### Users (Admin)
- `GET /api/users?city=...` - Filter by location
- `GET /api/users/cities` - Get cities with user counts

## Demo Accounts
```
Admin: admin@ecocollect.com / admin123
Company: company@ecocollect.com / company123
Driver: driver@ecocollect.com / driver123
Resident: user@example.com / user123
```

## Common Issues

### Backend won't start
- Check MongoDB connection in `.env`
- Default: MongoDB Atlas connection string provided

### Frontend can't connect to backend
- Backend must run on port 5000
- Frontend proxy in `vite.config.js` points to `http://localhost:5000`

### Build errors
```bash
cd frontend && npm run build  # Check for compilation errors
```

## What Was Removed
- Waste categories system (no longer needed - subscription-based model)
- Category routes and components

## File Locations
- Backend routes: `backend/routes/`
- Frontend pages: `frontend/src/pages/`
- Frontend API: `frontend/src/services/api.js`
- Backend models: `backend/models/`