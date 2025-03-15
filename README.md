🎯 Coupon Distribution System

📌 Overview

This project implements a Coupon Distribution System designed to:

✅ Distribute coupons fairly to guest users.

✅ Prevent abuse using IP tracking, cookies, and cooldown timers.

✅ Provide clear user feedback for successful claims and cooldowns.

🛠️ Setup Instructions

🔧 Frontend Setup (React + Vite + Tailwind)

1️⃣ Clone the frontend repo:

git clone <frontend_repo_url>
cd frontend

2️⃣ Install dependencies:

npm install

3️⃣ Start the development server:

npm run dev

✅ Frontend runs at: http://localhost:5173

🔧 Backend Setup (Node.js + Express + Prisma)

1️⃣ Clone the backend repo:

git clone <backend_repo_url>
cd backend

2️⃣ Install backend dependencies:

npm install

3️⃣ Set environment variables:
Create a .env file:

DATABASE_URL="your_prisma_db_url"

4️⃣ Generate Prisma client and migrate database:

npx prisma generate
npx prisma migrate dev --name init

5️⃣ Start the backend server:

npm run dev

✅ Backend runs at: http://localhost:3000

🔥 Abuse Prevention Strategies

🛠️ 1️⃣ IP Tracking

Captures the user’s IP (req.ip).

Blocks repeated claims from the same IP within 1 hour.

🔒 2️⃣ Cookie Tracking

Generates a unique user identifier (uuid) on first visit and stores it in a cookie.

Tracks users even if their IP changes (VPN, mobile network, etc.).

⏳ 3️⃣ Cooldown Timer (1 Hour)

Each user (IP + cookie) has a "last claim timestamp" stored in the database.

Users trying to claim again before 1 hour see a "Cooldown active" message.

🛡️ 4️⃣ Round-Robin Coupon Distribution

Coupons are distributed sequentially (sorted by id ASC).

Claimed coupons are marked "used" to avoid duplicates.

🎉 User Feedback

The system provides clear feedback:

✅ Success: 🎉 "You claimed the SUMMER25 coupon!"

✅ Cooldown active: ⏳ "Please wait 15 minutes before claiming another coupon."

✅ No coupons left: 🚫 "No coupons available right now — check back later!"

✅ Error: ❌ "Something went wrong, please try again."

🔥 Technologies Used

🚀 Frontend:

React (Vite) — Fast frontend setup

TailwindCSS — Clean, responsive styling

Axios — API requests

JS-Cookie — User tracking

🔥 Backend:

Node.js + Express — API server

Prisma ORM — Database management

SQLite/PostgreSQL — Database

dotenv — Environment handling

✨ Now you're ready to distribute coupons — fairly, securely, and efficiently! 🚀
