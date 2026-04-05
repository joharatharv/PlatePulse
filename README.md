# PlatePulse - AI-Powered Meal Tracking App

PlatePulse is an intelligent meal tracking application designed for Indian cuisine.

## Features

- Snap Meal: Take photos of your meals for AI-powered food recognition
- Nutrition Tracking: Track calories, protein, carbs, fat, and more
- Daily and Weekly Summaries: Visualize your nutrition progress
- Indian Food Database: 50+ Indian dishes with accurate nutrition data
- Goal Setting: Set and track personalized nutrition goals

## Tech Stack

- Frontend: React 18 + Vite + React Router
- Backend: Python Flask
- Database: MongoDB

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# Frontend
cd PlatePulse
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### 2. Start MongoDB

```bash
# Linux
sudo systemctl start mongod

# Or Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 3. Initialize Database

```bash
cd backend
python init_db.py
```

### 4. Start Servers

Terminal 1 - Backend:
```bash
cd backend
python server.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 5. Open App

http://localhost:5173

## API Endpoints

- GET /api/health - Health check
- GET /api/users/demo - Get demo user
- GET /api/meals - Get meals for a date
- POST /api/meals - Log a new meal
- GET /api/summary - Get daily summary
- GET /api/weekly - Get weekly data
- GET /api/foods - Search food database

## Environment Variables

Create backend/.env for custom configuration:

```
MONGO_URI=mongodb://localhost:27017
```

For MongoDB Atlas:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/platepulse
```
