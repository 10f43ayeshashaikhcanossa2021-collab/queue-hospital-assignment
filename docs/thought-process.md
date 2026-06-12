# Thought Process

The application is organized around one queue state and four user experiences: receptionist, patient display, patient tracking, doctor, and admin analytics.

Queue changes are centralized in the backend so REST routes and sockets always share the same logic. That keeps token generation, wait-time estimates, no-show handling, and consultation duration tracking consistent.

The frontend reads the same queue state through TanStack Query and Socket.IO. Live updates invalidate the relevant queries instead of duplicating state in the UI.

The codebase uses a memory-backed store by default so the app runs in a clean workspace immediately, while still including MongoDB/Mongoose models and a deployable database path for production.