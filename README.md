# PrepQuest Nepal

PrepQuest Nepal is a gamified Loksewa preparation platform designed to help Nepali students prepare for exams such as Nayab Subba and Sakha Adhikrit through quizzes, mock tests, XP, coins, badges, streaks, leaderboards, and weekly tournaments.

## Project Overview

Many Loksewa aspirants already use books, PDFs, YouTube videos, and MCQ websites, but they often struggle with consistency, motivation, and progress tracking. PrepQuest Nepal solves this problem by turning exam preparation into an engaging learning journey.

The platform allows users to select their exam track, choose their preferred question language, practice questions, take mock tests, earn rewards, track progress, and compete with other learners.

## Active Prototype Exam Tracks

- Nayab Subba
- Sakha Adhikrit

## Future Exam Tracks

- Kharidar
- Computer Operator
- Banking Exam
- Teacher Service Commission
- Technical Loksewa Exams
- Provincial Loksewa Exams

## Main Features

- User registration and login
- Exam track selection
- Language selection: Nepali, English, or Both
- Subject-wise practice
- Daily quiz
- 3 free mock tests every day
- Extra mock tests using coins
- XP and level system
- Coins reward system
- Rank system
- Badge system
- Daily streak system
- Weekly leaderboard
- Friday Loksewa Battle tournament
- Progress dashboard
- Profile page
- Admin question manager

## Gamification Features

PrepQuest Nepal uses gamification to improve motivation and consistency.

Main gamification elements include:

- XP for completing learning activities
- Coins for rewards and extra features
- Badges for achievements
- Ranks for long-term progress
- Streaks for daily study habits
- Leaderboards for competition
- Weekly tournaments for social engagement
- Progress bars for visible improvement

## Ethical Gamification

The platform is designed to keep learning fair and accessible.

Important rules:

- Basic learning is not locked.
- Every user gets 3 free mock tests daily.
- Coins are used only for extra mock tests and optional features.
- No betting system is used.
- No gambling-style rewards are used.
- No loot boxes are used.
- Leaderboards reset weekly or monthly to give new users a fair chance.

## Tech Stack

This project uses the PERN stack.

### Frontend

- React
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- bcryptjs
- Zod Validation
- Morgan
- CORS
- Nodemon

### Database

- PostgreSQL
- Sequelize

## Project Structure

```txt
PrepQuest/
├── backend/
├── frontend/
├── database/
├── docs/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Backend Folder

```txt
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeders/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Frontend Folder

```txt
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NishanSapsanamcha/PrepQuest-Nepal.git
cd PrepQuest-Nepal
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Create environment files

For backend on Windows:

```bash
copy backend\.env.example backend\.env
```

For frontend on Windows:

```bash
copy frontend\.env.example frontend\.env
```

On Mac or Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Create PostgreSQL database

Create a PostgreSQL database named:

```txt
prepquest_nepal
```

### 5. Update backend environment variables

Open:

```txt
backend/.env
```

Update your PostgreSQL username and password:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prepquest_nepal
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_this_with_secure_secret
```

### 6. Run the project

From the root folder:

```bash
npm run dev
```

This starts both backend and frontend.

Backend:

```txt
http://localhost:5000
```

Frontend:

```txt
http://localhost:5173
```

Health check:

```txt
http://localhost:5000/api/health
```

## Useful Commands

Run both frontend and backend:

```bash
npm run dev
```

Run backend only:

```bash
npm run backend
```

Run frontend only:

```bash
npm run frontend
```

Install all dependencies:

```bash
npm run install:all
```

## Current Status

The project currently has the initial PERN stack setup with:

- Backend folder structure
- Frontend folder structure
- Sequelize setup
- PostgreSQL connection setup
- Vite React frontend setup
- Root command to run frontend and backend together
- Git ignore setup for node_modules and .env files

## Future Development Plan

1. Build authentication system
2. Add exam selection
3. Add language selection
4. Create dashboard UI
5. Add question models and seed data
6. Build quiz system
7. Build mock test system
8. Add XP and coins logic
9. Add badges and streaks
10. Add leaderboard
11. Add Friday tournament demo
12. Add admin question manager

## Author

PrepQuest Nepal is a student project focused on gamified learning and Loksewa preparation in Nepal.
