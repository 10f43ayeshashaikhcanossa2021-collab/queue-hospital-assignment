# Queue Cure

Queue Cure is a real-time clinic queue management system for receptionists, doctors, admins, and patients. It includes sequential token generation, live queue updates, analytics, QR tracking, JWT auth, and role-based dashboards.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, TanStack Query, Socket.IO Client, React Hook Form, Recharts, Framer Motion
- Backend: Node.js, Express, Socket.IO, MongoDB/Mongoose models, JWT, bcrypt, Express Validator

## Run locally

1. Install dependencies from the repo root with `npm install`.
2. Start the backend with `npm run dev:server`.
3. Start the frontend with `npm run dev:client`.

If you want MongoDB locally, use `docker compose up mongo` or your own Atlas connection string in `server/.env`.

## Demo credentials

- Admin: admin@queuecure.dev / Password123!
- Receptionist: reception@queuecure.dev / Password123!
- Doctor: doctor@queuecure.dev / Password123!