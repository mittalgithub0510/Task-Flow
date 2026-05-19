# TaskFlow Pro – Smart Internship & Team Task Manager

## Introduction
TaskFlow Pro is a comprehensive, full-stack Smart Internship and Team Task Management system designed to bridge the gap between traditional project management and internship tracking. The platform empowers Admins (Managers/Mentors) to assign tasks, monitor daily standups, review submissions with proof, and award performance badges. Members (Interns) can track their projects, submit work with live proofs, raise blockers, and ultimately earn certifications based on their performance score.

---

## 🚀 Main Features

### 👑 Admin Features
- **Comprehensive Dashboard:** Live analytics on total projects, members, task statuses, and overdue tasks.
- **Smart Notification System:** Real-time 2-way tracking. Get alerted when members join projects, submit tasks, or raise blockers.
- **Project & Task Management:** Create, assign, edit, and track projects and tasks.
- **Review System:** Evaluate member submissions, check GitHub/Live demo links, add review comments, and approve/reject with quality scores.
- **Performance Scoring:** Automatically awards or deducts points based on on-time submissions, rejected tasks, and completed standups.
- **Team Monitoring:** View all interns on a single page, track the specific projects they have joined, and view their live performance points.
- **Daily Standups & Blockers:** Read daily updates and resolve developer blockers dynamically.
- **Automated Certifications:** Issue dynamically generated certificates based on performance and completed task metrics.

### 💻 Member Features
- **Personalized Dashboard:** Track assigned tasks, total points, badges, and overdue warnings.
- **Smart Notification System:** Get instantly alerted when Admins assign you tasks, post announcements, or review your submissions.
- **Global Project Discovery:** Browse all company projects and "Join" them dynamically.
- **Proof-Based Task Submission:** Cannot mark tasks as "Completed" directly; must submit GitHub links, live demos, and a time-taken summary for admin review.
- **Daily Standups:** Submit standard Agile updates (Yesterday, Today, Blockers).
- **Blocker Raising:** Raise high-priority issues that prevent task completion and track admin replies.
- **Gamification:** Earn performance scores that unlock rank titles and badges.

---

## 🛠️ Tech Stack
**Frontend:**
- React.js (Vite)
- Tailwind CSS v4
- React Router DOM
- Axios
- Context API (Authentication State)

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for secure authentication
- bcrypt.js for password hashing

---

## 📂 Folder Structure

```
TaskFlow/
│
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route logic (Auth, Projects, Tasks, Standups, etc.)
│   ├── middleware/      # JWT Auth and Role Protection
│   ├── models/          # Mongoose Schemas
│   ├── routes/          # Express API Routes
│   ├── utils/           # Helper functions (Overdue checker, Badges)
│   ├── app.js           # Express App Setup
│   ├── server.js        # Server Entry Point
│   └── .env             # Environment Variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (Auth tracking, Protected Routes)
│   │   ├── context/     # AuthContext provider
│   │   ├── layouts/     # Dashboard Sidebar & Navbar wrapper
│   │   ├── pages/       # Core views (Dashboards, Projects, Tasks, Team)
│   │   ├── services/    # Axios API interceptors
│   │   ├── App.jsx      # React Entry
│   │   └── index.css    # Tailwind styling
│
└── package.json         # Root Concurrently setup
```

---

## ⚙️ Installation & Setup

1. **Clone the repository and install dependencies:**
   Make sure you are in the root directory, then run:
   ```bash
   npm run install-all
   ```
   *(Or manually run `npm install` inside both `backend/` and `frontend/` folders).*

2. **Environment Variables:**
   Ensure your `backend/.env` file contains:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   NODE_ENV=development
   ```

3. **Run the Application:**
   From the root directory, run both servers concurrently:
   ```bash
   npm run dev
   ```
   - **Frontend** runs on `http://localhost:5173`
   - **Backend** runs on `http://localhost:5000`

---

## 🚀 Deployment (Render/Heroku)
The project is configured for **Unified Deployment**. You can deploy both the Node backend and React frontend as a single Web Service!
1. Set the Build Command: `npm run build`
2. Set the Start Command: `npm start`
3. Add `NODE_ENV=production` in your server environment variables.
The Node backend will automatically serve the built React frontend!

---

## 🔑 Test Credentials

**Admin Account**
- **Email:** `admin@taskflow.com`
- **Password:** `admin123`

**Member Account**
- **Email:** `member@taskflow.com`
- **Password:** `member123`

---

## 🔮 Future Scope
- Implementation of WebSocket (Socket.io) for real-time notifications and chat.
- Advanced Chart.js visual analytics on the Admin Dashboard.
- Export to PDF/CSV functionality for member reports.
- Automated email triggers using Nodemailer for major project updates.
