# Task Management System

A complete full-stack Task Management System built with Node.js, TypeScript, Prisma, and Next.js.

## 🌐 Live Application

- **Frontend (Vercel):** [https://task-management-system-one-iota.vercel.app](https://task-management-system-one-iota.vercel.app)
- **Backend API (Render):** [https://task-management-system-21l7.onrender.com](https://task-management-system-21l7.onrender.com)
- **Backend Health Check:** [https://task-management-system-21l7.onrender.com/health](https://task-management-system-21l7.onrender.com/health)

## Project Structure

```
Task Management System/
├── backend/          # Node.js + TypeScript + Prisma API
└── frontend/         # Next.js + TypeScript Web Application
```

## Features

### Backend API
- ✅ User Authentication (Register, Login, Logout)
- ✅ JWT-based security with Access & Refresh Tokens
- ✅ Password hashing with bcrypt
- ✅ Welcome email for new users (automatically sent on registration)
- ✅ Complete Task CRUD operations
- ✅ Pagination, Filtering, and Search functionality
- ✅ TypeScript with proper type safety
- ✅ Prisma ORM with PostgreSQL

### Frontend Web App
- ✅ Responsive design (works on desktop and mobile)
- ✅ Login and Registration pages
- ✅ Password visibility toggle (show/hide)
- ✅ Password format requirements with real-time validation
- ✅ Task Dashboard with filtering and search
- ✅ Create, Edit, Delete, and Toggle task status
- ✅ Stats dashboard (Total, Pending, In Progress, Completed tasks)
- ✅ Pagination (9 tasks per page)
- ✅ Toast notifications for user feedback (success, error, validation messages)
- ✅ Clear error messages for invalid email, password, and expired tokens
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Dark mode support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Quick Start - How to Run

### First Time Setup

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE taskmanagement;
   ```

2. **Backend (Terminal 1):**
   ```bash
   cd backend
   npm install
   # Create .env file (see Environment Variables section below)
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```
   Backend runs on: `http://localhost:3001`

3. **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm install
   # Create .env.local file with: NEXT_PUBLIC_API_URL=http://localhost:3001
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

4. **Open browser:** Go to `http://localhost:3000` and register/login

### Running After Setup

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Setup Instructions

### Step 1: Database Setup

First, make sure you have PostgreSQL installed and running. Create a new database:

```sql
CREATE DATABASE taskmanagement;
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file in the backend directory
# Copy the following and update with your database credentials:

DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement?schema=public"
JWT_ACCESS_SECRET=change_this_to_a_random_secret_string_min_32_chars
JWT_REFRESH_SECRET=change_this_to_another_random_secret_string_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email Configuration (for welcome emails)
# Configure these to send welcome emails to new users
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Generate Prisma Client
npm run prisma:generate

# Run database migrations (creates all tables)
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

**Note:** For JWT secrets, use long random strings (at least 32 characters). You can generate them using:
```bash
openssl rand -base64 32
```

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file in the frontend directory
# Add the following:
NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### Step 4: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You'll be redirected to the login page
3. Click "create a new account" to register
4. After registration, you'll be logged in automatically
5. If email is configured, you'll receive a welcome email in your inbox
6. Start creating and managing your tasks!

## Environment Variables

### Backend (.env file in backend directory)

#### Local Development

Create a `.env` file in the `backend` directory with the following:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement?schema=public"
JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_characters
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000

# Email Configuration (for welcome emails)
# Configure these to send welcome emails to new users upon registration
# If not configured, the app will work normally but won't send welcome emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Production (Render)

The following environment variables are configured in Render:

```env
DATABASE_URL="postgresql://postgres:password@host:port/railway?schema=public"
# Get this from Railway Postgres service → Variables → DATABASE_URL

JWT_ACCESS_SECRET=your_32_character_minimum_random_secret
JWT_REFRESH_SECRET=your_32_character_minimum_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://task-management-system-one-iota.vercel.app

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

**Important:**
- Replace `username` and `password` with your PostgreSQL credentials
- JWT secrets should be long, random strings (at least 32 characters)
- Never commit the `.env` file to version control
- **Production DATABASE_URL:** Get from Railway Postgres service → Variables tab → Copy `DATABASE_URL`
- **Email Configuration (for Welcome Emails):** 
  - When configured, new users will automatically receive a welcome email upon registration
  - For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
  - For other providers: Update SMTP_HOST and SMTP_PORT accordingly
  - If email is not configured, the app will work normally but won't send welcome emails
  - **Note:** Email sending may timeout in production environments. This is non-critical and doesn't affect registration.

### Frontend (.env.local file in frontend directory)

#### Local Development

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Production (Vercel)

The following environment variable is configured in Vercel:

```env
NEXT_PUBLIC_API_URL=https://task-management-system-21l7.onrender.com
```

## API Endpoints

### Authentication

All authentication endpoints are public (no token required).

- **POST /auth/register** - Register a new user
  - Body: `{ email, password, name }`
  - Response: `{ accessToken, refreshToken, user }`
  - Note: Sends a welcome email to the new user (if email is configured)

- **POST /auth/login** - Login user
  - Body: `{ email, password }`
  - Response: `{ accessToken, refreshToken, user }`

- **POST /auth/refresh** - Refresh access token
  - Body: `{ refreshToken }`
  - Response: `{ accessToken }`

- **POST /auth/logout** - Logout user
  - Body: `{ refreshToken }`
  - Response: `{ message }`

### Tasks

All task endpoints require authentication (Bearer token in Authorization header).

- **GET /tasks** - Get all tasks
  - Query params: `?page=1&limit=9&status=PENDING&search=title`
  - Response: `{ tasks: [], pagination: { page, limit, total, totalPages }, statusCounts: { pending, inProgress, completed } }`

- **GET /tasks/:id** - Get single task
  - Response: `{ task }`

- **POST /tasks** - Create new task
  - Body: `{ title, description?, status? }`
  - Response: `{ task }`

- **PATCH /tasks/:id** - Update task
  - Body: `{ title?, description?, status? }`
  - Response: `{ task }`

- **DELETE /tasks/:id** - Delete task
  - Response: `{ message }`

- **POST /tasks/:id/toggle** - Toggle task status (PENDING → IN_PROGRESS → COMPLETED → PENDING)
  - Response: `{ task }`

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running
- Verify your DATABASE_URL in the backend `.env` file is correct
- Check that the database `taskmanagement` exists
- **Production:** Ensure `DATABASE_URL` from Railway is correctly set in Render environment variables

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Next.js will automatically use the next available port

### CORS Errors
- Make sure FRONTEND_URL in `backend/.env` matches your frontend URL
- Default is `http://localhost:3000`
- **Production:** Ensure `FRONTEND_URL` in Render matches your Vercel frontend URL exactly

### Token Issues
- Make sure JWT secrets are set in `backend/.env`
- They should be long, random strings (at least 32 characters)

### Production Deployment Issues

#### Backend 500 Errors
- **Prisma Migrations:** Ensure migrations are run. Update Render build command to include:
  ```
  npm install && npm run prisma:generate && npm run prisma:migrate:deploy && npm run build
  ```
- **Database Connection:** Verify `DATABASE_URL` is correctly set in Render environment variables
- **Check Logs:** View Render service logs for detailed error messages

#### Email Timeout Errors
- Email sending may timeout in production (non-critical)
- Registration will still work even if email fails
- To fix: Use Gmail App Password or switch to a production email service (SendGrid, Mailgun, etc.)
- To disable: Remove SMTP environment variables from Render

#### Frontend API Connection
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render backend URL
- Check browser console for CORS or network errors
- Ensure backend `FRONTEND_URL` matches your Vercel frontend URL

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Deployment

### Production URLs

- **Frontend:** [https://task-management-system-one-iota.vercel.app](https://task-management-system-one-iota.vercel.app)
  - Hosted on Vercel
  - Framework: Next.js
  - Auto-deploys from `main` branch

- **Backend API:** [https://task-management-system-21l7.onrender.com](https://task-management-system-21l7.onrender.com)
  - Hosted on Render
  - Framework: Node.js + Express
  - Auto-deploys from `main` branch

- **Database:** PostgreSQL on Railway
  - Connection string available in Railway Postgres service → Variables → `DATABASE_URL`
  - Used by backend for data persistence

### Deployment Platforms

#### Frontend (Vercel)
- **Platform:** [Vercel](https://vercel.com)
- **Repository:** Connected to GitHub
- **Build Command:** `npm run build`
- **Root Directory:** `frontend`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL` = Backend API URL

#### Backend (Render)
- **Platform:** [Render](https://render.com)
- **Repository:** Connected to GitHub
- **Build Command:** `npm install && npm run prisma:generate && npm run prisma:migrate:deploy && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `backend`
- **Environment Variables:**
  - `DATABASE_URL` = PostgreSQL connection string from Railway
  - `JWT_ACCESS_SECRET` = 32+ character random string
  - `JWT_REFRESH_SECRET` = 32+ character random string
  - `JWT_ACCESS_EXPIRES_IN` = `15m`
  - `JWT_REFRESH_EXPIRES_IN` = `7d`
  - `PORT` = `3001`
  - `FRONTEND_URL` = Frontend Vercel URL
  - `SMTP_*` = Email configuration (optional)

#### Database (Railway)
- **Platform:** [Railway](https://railway.app)
- **Service:** PostgreSQL
- **Connection:** Access via `DATABASE_URL` environment variable
- **Migrations:** Run automatically during backend deployment via `prisma:migrate:deploy`

## Technologies Used

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- express-validator

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- react-hot-toast

## License

MIT License - This project is licensed under the MIT License. See LICENSE file for details.


