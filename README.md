# iSpace Recruitment Management System (IRMS)

Recruitment Referral Management System built with React, Express, MongoDB, Mongoose, JWT, and plain CSS.

## Setup

1. Copy `server/.env.example` to `server/.env` and configure MongoDB/JWT.
2. Copy `client/.env.example` to `client/.env`.
3. Run `npm run install:all`.
4. Seed: `npm --prefix server run seed`.
5. Start API with `npm run server` and UI with `npm run client`.

Demo: `admin@referral.local / Admin@123`; `candidate@referral.local / Candidate@123`.

Protected APIs use `Authorization: Bearer <JWT>`. Key routes: `/api/auth`, `/api/jobs`, `/api/applications`, `/api/dashboard`, `/api/profile`, and `/api/notifications`.



env file:

PORT=5000

NODE_ENV=development

MONGODB_URI=mongodb+srv://2200032338cseh_db_user:Chaitu%40123@cluster0.wpfbd2n.mongodb.net/referral_management?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=referflow_9d5a7e2c1b8f4a6d3e0c7b9f2a5d8e1c

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
