# iSpace Recruitment Management System (IRMS)

A full-stack Recruitment Referral Management System built with React, Express, MongoDB, and JWT authentication.

## Features

- **Candidate Portal**: Browse jobs, submit referrals, track applications
- **HR Admin Portal**: Manage jobs, review applications, update statuses
- **Super Admin Portal**: Manage HR admins, activate/deactivate accounts
- **Real-time Notifications**: Application status updates
- **Resume Upload**: PDF, DOC, DOCX support (max 5MB)

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Vite, TailwindCSS
- **Backend**: Express.js, MongoDB, Mongoose, JWT, Multer
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection, Mongo Sanitization

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment:
   ```bash
   # Server
   cp server/.env.example server/.env
   # Edit server/.env with your MongoDB URI and JWT secret
   
   # Client
   cp client/.env.example client/.env
   ```

4. Create superadmin account:
   ```bash
   npm --prefix server run create-superadmin
   ```

5. (Optional) Seed demo data:
   ```bash
   npm --prefix server run seed
   ```

6. Start development servers:
   ```bash
   # Terminal 1: API server
   npm run server
   
   # Terminal 2: React client
   npm run client
   ```

### Demo Accounts (after seeding)
- **Super Admin**: `superadmin@referral.local` / `Superadmin@123`
- **HR Admin**: `admin@referral.local` / `Admin@123`
- **Candidate**: `candidate@referral.local` / `Candidate@123`

## Production Deployment

### Backend (Node.js hosting - Railway, Render, etc.)

1. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secure-random-secret-min-32-chars
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-domain.com
   ```

2. Build command: `npm install`
3. Start command: `npm start`
4. Ensure `/uploads` directory is writable for resume storage

### Frontend (Vercel, Netlify, etc.)

1. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```

2. Build command: `npm run build`
3. Output directory: `dist`
4. Install command: `npm install`

### Important Notes

- Generate a strong JWT_SECRET (at least 32 characters)
- CLIENT_URL should be the exact frontend domain (supports comma-separated for multiple)
- For Vercel, the `vercel.json` handles SPA routing
- Resume uploads are stored in `server/src/uploads/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register candidate
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/change-password` - Change password

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (admin)
- `PATCH /api/jobs/:id` - Update job (admin)
- `DELETE /api/jobs/:id` - Delete job (admin)

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Submit referral (candidate)
- `GET /api/applications/:id` - Get application details
- `PATCH /api/applications/:id/status` - Update status (admin)
- `PATCH /api/applications/:id/withdraw` - Withdraw (candidate)

### Dashboard & Misc
- `GET /api/dashboard` - Dashboard stats
- `PATCH /api/profile` - Update profile
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/mark-all-read` - Mark all read
- `DELETE /api/notifications/clear-all` - Clear all

### User Management (Super Admin)
- `GET /api/users` - List HR admins
- `POST /api/users/admins` - Create HR admin
- `PATCH /api/users/:id/status` - Activate/deactivate admin

## License

MIT
