# 🚀 TaskFlow Enterprise Platform

TaskFlow is a production-grade, high-fidelity project management ecosystem designed for modern enterprise teams. It combines strategic timeline orchestration with robust administrative controls and data isolation.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)

## ✨ Core Features

- **Strategic Timeline**: High-fidelity board with native date picking, team synchronization, and multi-stage execution tracking.
- **Control Center**: Unified administrative portal for global user governance, role promotion, and team orchestration.
- **Role-Based Access Control (RBAC)**: Strict data siloing where Members only see relevant team objectives while Admins maintain full operational visibility.
- **Enterprise Aesthetics**: Premium glassmorphic UI with dark mode support, custom micro-interactions, and fluid transitions.
- **Live State Sync**: Real-time updates for team membership and task status across the organization.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express 5, JWT Authentication, Bcrypt encryption
- **Database**: MongoDB Atlas (Production) / NeDB (Local Fallback)
- **Deployment**: Optimized for Render / unified monolith deployment

## 🚀 Quick Start

### 1. Installation
Clone the repository and install dependencies for both frontend and backend:
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret
```

### 3. Development Mode
Run the frontend and backend concurrently:
```bash
# Terminal 1 (Frontend)
npm run dev

# Terminal 2 (Backend)
cd server && node index.js
```

### 4. Production Deployment
The application is configured for unified deployment:
```bash
npm run build   # Builds the optimized frontend
npm start       # Launches the full-stack platform
```

## 🌐 Live Deployment (Render)
TaskFlow is optimized for Render's Web Service:
1. Connect your GitHub repository.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Configure `MONGODB_URI` and `JWT_SECRET` in the Environment settings.

---

**Built with Precision by TaskFlow Engineering**
