# EcoCollect - Waste Pickup & Recycling System Frontend

A modern, responsive React frontend for the Waste Pickup & Recycling Request System.

## Features

- 🔐 **Authentication** - Secure login/registration with role-based access
- 📦 **Pickup Management** - Request, track, and manage waste pickups
- 💳 **Payments** - Stripe integration for payment processing
- 📡 **Real-time Updates** - Socket.io for live status updates
- 📱 **Responsive Design** - Mobile-first UI with glassmorphism styling

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time updates
- **Stripe** for payment integration
- **React Leaflet** for maps

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd waste-pickup-system/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration:**
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/
│   └── recycle-icon.svg
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── layout/         # Layout components (Navbar)
│   ├── context/            # React Context (Auth, Socket)
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## User Roles

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| **Resident** | My Pickups | Request pickups, track status, pay |
| **Company** | Manage | Assign drivers, update status |
| **Driver** | Assignments | View route, update pickup status |
| **Admin** | Full Access | Manage users, categories, all pickups |

## Demo Accounts

After running the seed script on the backend:
- **Admin:** admin@ecocollect.com / admin123
- **Company:** company@ecocollect.com / company123
- **Driver:** driver@ecocollect.com / driver123
- **Resident:** user@example.com / user123

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | Yes |
| `VITE_SOCKET_URL` | Socket.io server URL | No |

## Payment Testing

Use Stripe test card numbers:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

## API Integration

The frontend communicates with the backend via REST API. All authenticated endpoints require a JWT token in the Authorization header.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend is running and the `VITE_API_URL` is correctly set.

### Socket Connection Issues
If real-time updates aren't working, check that the Socket.io server is running and accessible.

### Payment Issues
Ensure you're using Stripe test mode and a valid test card number.

## License

MIT License