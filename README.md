# Coupon Distribution System

Overview
This project implements a Coupon Distribution System designed to:

    1. Distribute coupons fairly to guest users.
    2. Prevent abuse using IP tracking, cookies, and cooldown timers.
    3. Provide clear user feedback for successful claims and cooldowns.

## Installation

### Frontend Setup (React + Vite + Tailwind)

#### Clone the Repo

```bash
  git clone https://github.com/Keshavvakul/assignment-sales-studio
  cd cd frontend
```

#### Install dependencies:

```bash
  npm install
```

#### Start the development server

```bash
  npm run dev
```

Frontend runs at: http://localhost:5173

### Backend Setup (Node.js + Express + Prisma)

#### Clone the backend repo

```bash
  git clone https://github.com/Keshavvakul/assignment-sales-studio
  cd backend
```

#### Install dependencies:

```bash
  npm install
```

#### Set environment variables

Create a .env file in root of the backend folder and inside enter:

```bash
 DATABASE_URL="your_prisma_db_url"
```

#### Generate Prisma client and migrate the database:

```bash
 npx prisma generate
 npx prisma migrate dev --name init
```

#### Start the backend server

```bash
  npm run dev
```

##### Backend runs at: http://localhost:3000

## Features

### Abuse Prevention Strategies

- Captures the user’s IP.
- Blocks repeated claims from the same IP within 1 hour.

### Cookie Tracking

- Generates a unique user identifier on the first visit and stores it in a cookie.
- Tracks users even if their IP changes (e.g., VPN, mobile network).

### Cooldown Timer (1 Hour)

- Each user (IP + cookie) has a "last claim timestamp" stored in the database.
- Users trying to claim again before 1 hour see a "Cooldown active" message.

### Round-Robin Coupon Distribution

- Coupons are distributed sequentially (sorted by id ASC).
- Claimed coupons are marked "used" to avoid duplicates.

## User Feedback

- Success: "You claimed the SUMMER25 coupon!"
- Cooldown active: "Please wait 15 minutes before claiming another coupon."
- No coupons left: "No coupons available right now — check back later!"
- Error: "Something went wrong, please try again."

## Technologies Used

### Frontend:

- React (Vite) — Fast, lightweight frontend setup
- TailwindCSS — Clean, responsive styling
- Axios — API request
- JS-Cookie — User tracking

### Backend

- Node.js + Express — API server
- Prisma ORM — Database management
- PostgreSQL — Database
- dotenv — Environment handling
