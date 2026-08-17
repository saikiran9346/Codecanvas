<div align="center">

# ⚡ CodeCanvas

### *Where Code Meets Collaboration*

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

**A full-stack collaborative coding platform** — write code, solve problems, join real-time rooms, track contests, and connect with fellow developers. All in one sleek, dark-themed interface.

[🚀 Live Demo](https://codecanvas-eta.vercel.app) · [🐛 Report Bug](https://github.com/saikiran9346/Codecanvas/issues) · [💡 Request Feature](https://github.com/saikiran9346/Codecanvas/issues)

</div>

---

## 📸 Screenshots

<div align="center">

| Home Page | Dashboard |
|:---------:|:---------:|
| ![Home Page](screenshots/Home.png) | ![Dashboard](screenshots/dashboard.png) |

| Code Editor | Problems Page |
|:-----------:|:-------------:|
| ![Code Editor](screenshots/code_editor.png) | ![Problems](screenshots/problemspage.png) |

| Collaborative Rooms | Contest Calendar |
|:--------------------:|:----------------:|
| ![Rooms](screenshots/rooms.png) | ![Calendar](screenshots/calendar1.png) |

| Login | Register |
|:-----:|:--------:|
| ![Login](screenshots/loginpage.png) | ![Register](screenshots/registerpage.png) |

| User Profile |  Calendar (Detail View) |
|:------------:|:-----------------------:|
| ![Profile](screenshots/profile.png) | ![Calendar Detail](screenshots/calendar2.png) |

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🖥️ **Code Editor** | Write & run code in **C++, Python, Java, JavaScript** with syntax highlighting (CodeMirror + Dracula theme) and instant output via Piston API |
| 🧩 **LeetCode Problems** | Browse LeetCode problems, view details, read discussions, and submit your solutions — all within CodeCanvas |
| 🏠 **Real-Time Rooms** | Create or join collaborative coding rooms with **live code sync** powered by Socket.IO |
| 📅 **Contest Calendar** | Track upcoming contests from **Codeforces, LeetCode, and CodeChef** in one unified calendar |
| 💬 **Discussions** | Participate in threaded discussions on any problem — share approaches and learn from others |
| 👤 **User Profiles** | Manage your profile, update skills, link your Codeforces handle, and view other developers' profiles |
| 🔐 **Auth System** | Secure JWT-based authentication with password hashing (bcrypt) |
| 🌙 **Dark Theme** | Sleek, modern dark UI designed for long coding sessions |
| 📱 **Responsive** | Works smoothly on desktop, tablet, and mobile devices |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with component-based architecture |
| **Vite 6** | Lightning-fast build tool and dev server |
| **React Router v7** | Client-side routing and navigation |
| **CodeMirror 6** | Feature-rich code editor with syntax highlighting |
| **Monaco Editor** | Alternative editor integration |
| **Socket.IO Client** | Real-time communication for collaborative rooms |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Modern icon library |
| **React Markdown** | Render markdown content in discussions |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express 5** | RESTful API server |
| **MongoDB + Mongoose 8** | NoSQL database and ODM |
| **Socket.IO** | WebSocket server for real-time collaboration |
| **JWT** | Stateless authentication tokens |
| **bcrypt** | Secure password hashing |
| **Groq SDK** | AI-powered features |
| **dotenv** | Environment variable management |

### External APIs
| API | Purpose |
|-----|---------|
| [**Piston API**](https://github.com/engineer-man/piston) | Secure remote code execution (C++, Python, Java, JS) |
| [**Alfa LeetCode API**](https://alfa-leetcode-api.onrender.com) | LeetCode problem data and user stats |
| **Codeforces API** | Contest schedules from Codeforces |
| **CodeChef API** | Contest schedules from CodeChef |

---

## 📁 Project Structure

```
CodeCanvas/
│
├── 📂 backend/                    # Express.js API server
│   ├── 📂 config/
│   │   └── db.js                  # MongoDB connection setup
│   ├── 📂 middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── 📂 models/
│   │   ├── UserModel.js           # User schema (username, password, skills, etc.)
│   │   ├── Solution.js            # Code solution schema
│   │   ├── DiscussionModel.js     # Discussion thread schema
│   │   ├── bookmarksModel.js      # User bookmarks schema
│   │   └── messageModel.js        # Chat/room message schema
│   ├── 📂 routes/
│   │   ├── LoginRoute.js          # POST /login, POST /register
│   │   ├── Profile.js             # GET/POST /user/profile, /user/:id
│   │   ├── Solutions.js           # CRUD /api/solutions
│   │   ├── Discussions.js         # CRUD /discussions
│   │   └── Contests.js            # GET /api/contests (LeetCode, CF, CC)
│   ├── socketHandler.js           # Socket.IO event handlers (rooms, live code sync)
│   ├── index.js                   # 🚀 App entry point — Express + Socket.IO setup
│   ├── package.json               # Backend dependencies
│   └── .env                       # ⚠️ Backend environment variables (create this!)
│
├── 📂 frontend/                   # React + Vite SPA
│   ├── 📂 public/
│   │   └── logo.png               # App favicon/logo
│   ├── 📂 src/
│   │   ├── 📂 assets/             # Static images (logos, icons)
│   │   ├── 📂 components/
│   │   │   ├── Header.jsx         # Navigation bar
│   │   │   ├── CodeEditor.jsx     # CodeMirror code editor component
│   │   │   ├── LanguageSelector.jsx # Language dropdown (C++/Python/Java/JS)
│   │   │   ├── EditProfile.jsx    # Profile editing form
│   │   │   ├── Problemcard.jsx    # Problem list card component
│   │   │   ├── RequireAuth.jsx    # Protected route wrapper
│   │   │   ├── Toast.jsx          # Toast notification component
│   │   │   ├── Loader.jsx         # Loading spinner
│   │   │   ├── constants.js       # 🔑 App constants (BACKEND_URL, language configs)
│   │   │   └── *.css              # Component-level styles
│   │   ├── 📂 pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Register.jsx       # Registration form
│   │   │   ├── Dashboard.jsx      # LeetCode problems dashboard
│   │   │   ├── ProblemDetail.jsx  # Individual problem view
│   │   │   ├── Discussion.jsx     # Problem discussion threads
│   │   │   ├── SolutionsList.jsx  # Solutions for a problem
│   │   │   ├── SolutionDetail.jsx # Individual solution view
│   │   │   ├── CodeEditorPage.jsx # Standalone code editor
│   │   │   ├── Calendar.jsx       # Contest calendar (CF + LC + CC)
│   │   │   ├── RoomSelection.jsx  # Room lobby (create/join)
│   │   │   ├── RoomPage.jsx       # Live collaborative room
│   │   │   ├── UserProfile.jsx    # Your profile page
│   │   │   └── FriendsProfile.jsx # View other users' profiles
│   │   ├── 📂 styles/             # Page-level CSS files
│   │   ├── App.jsx                # 🔀 Root component with all routes
│   │   ├── main.jsx               # React DOM entry point
│   │   └── index.css              # Global styles
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   └── .env                       # ⚠️ Frontend environment variables (create this!)
│
├── 📂 screenshots/                # App screenshots for README
├── .gitignore
├── vercel.json                    # Vercel deployment config
└── README.md                      # 📖 You are here!
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have these installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org) |
| **npm** | v9 or higher | Comes with Node.js |
| **MongoDB** | v6 or higher | [mongodb.com](https://www.mongodb.com/try/download/community) |
| **Git** | Any recent version | [git-scm.com](https://git-scm.com) |

> 💡 **Tip:** You can also use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud database) instead of installing MongoDB locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/saikiran9346/Codecanvas.git
cd Codecanvas
```

---

### 2️⃣ Install Dependencies

You need to install dependencies for **both** the backend and frontend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 3️⃣ Set Up Environment Variables

> ⚠️ **This step is critical!** The app won't work without these `.env` files.

#### 🔧 Backend — `backend/.env`

Create a file called `.env` inside the `backend/` folder:

```env
# ═══════════════════════════════════════════════════════════════
#  CODECANVAS BACKEND — Environment Variables
# ═══════════════════════════════════════════════════════════════

# MongoDB connection string
# 👉 For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/codecanvas
# 👉 For MongoDB Atlas (cloud), replace with your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecanvas

# Server port
PORT=3000

# JWT secret key — used to sign and verify authentication tokens
# ⚠️ IMPORTANT: Generate a strong, random key for production!
# Run this command to generate one:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_here

# Allowed frontend origins for CORS (comma-separated)
# 👉 For local development:
CLIENT_ORIGINS=http://localhost:5173
# 👉 For production, add your deployed frontend URL:
# CLIENT_ORIGINS=https://codecanvas-eta.vercel.app,http://localhost:5173
```

#### 🎨 Frontend — `frontend/.env`

Create a file called `.env` inside the `frontend/` folder:

```env
# ═══════════════════════════════════════════════════════════════
#  CODECANVAS FRONTEND — Environment Variables
# ═══════════════════════════════════════════════════════════════

# Code execution API (Piston) — runs user-submitted code securely
VITE_JUDGE=https://emkc.org/api/v2/piston/execute

# LeetCode problems API — fetches problem data, stats, and details
VITE_API_URL=https://alfa-leetcode-api.onrender.com

# Backend API URL
# 👉 For local development:
VITE_BACKEND_URL=http://localhost:3000
# 👉 For production, replace with your deployed backend URL:
# VITE_BACKEND_URL=https://your-backend.onrender.com
```

> **Why `VITE_` prefix?** Vite only exposes environment variables that start with `VITE_` to the frontend code. This is a security feature — it prevents accidentally leaking server-side secrets to the browser.

---

### 4️⃣ Start the Application

Open **two separate terminals**:

**Terminal 1 — Start Backend:**
```bash
cd backend
npm start
```
You should see: `Server running on port 3000` ✅

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173` ✅

---

### 5️⃣ Open in Browser

Navigate to **[http://localhost:5173](http://localhost:5173)** — register a new account and start coding! 🎉

---

## 🔌 API Routes

<details>
<summary><strong>Click to expand all API endpoints</strong></summary>

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register/` | Register a new user |
| `POST` | `/login/` | Login and receive JWT token |

### User Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/user/profile` | 🔒 | Get your profile |
| `POST` | `/user/profile/update` | 🔒 | Update profile details |
| `POST` | `/user/profile/update-password` | 🔒 | Change password |
| `GET` | `/user/:id` | 🔒 | View another user's profile |
| `GET` | `/users/:username` | — | Search users by username |

### Solutions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/solutions/:titleSlug` | 🔒 | Get solutions for a problem |
| `POST` | `/api/solutions` | 🔒 | Submit a new solution |
| `GET` | `/api/solutions/detail/:id` | 🔒 | Get a specific solution |

### Discussions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/discussions/:titleSlug` | 🔒 | Get discussions for a problem |
| `POST` | `/discussions` | 🔒 | Post a new discussion |

### Contests
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/contests` | Upcoming LeetCode contests |
| `GET` | `/api/contests/codeforces` | Upcoming Codeforces contests |
| `GET` | `/api/contests/codechef` | Upcoming CodeChef contests |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | API health check — returns `{ msg: "API is working !" }` |

### WebSocket Events (Socket.IO)
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a collaborative room |
| `code-change` | Client ↔ Server | Broadcast code changes to room members |
| `message` | Client ↔ Server | Send/receive chat messages in room |

</details>

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Set the **Root Directory** to `frontend`
4. Add environment variables in Vercel dashboard:
   ```
   VITE_JUDGE=https://emkc.org/api/v2/piston/execute
   VITE_API_URL=https://alfa-leetcode-api.onrender.com
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```
5. Deploy! 🚀

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set the **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://your-atlas-connection-string
   PORT=3000
   JWT_SECRET=your-production-secret-key
   CLIENT_ORIGINS=https://codecanvas-eta.vercel.app
   ```
7. Deploy! 🚀

> 💡 **Important:** Make sure the `VITE_BACKEND_URL` on Vercel points to your Render backend URL, and `CLIENT_ORIGINS` on Render includes your Vercel frontend URL.

---

## 🗺️ App Routes (Frontend)

| Route | Page | Auth Required |
|-------|------|:------------:|
| `/` | Home | ✅ |
| `/login` | Login | ❌ |
| `/register` | Register | ❌ |
| `/dashboard` | LeetCode Problems Dashboard | ✅ |
| `/problem/:titleSlug` | Problem Detail & Code Editor | ✅ |
| `/discussions/:titleSlug` | Problem Discussions | ✅ |
| `/solutions/:titleSlug` | Solutions List | ✅ |
| `/solution/:id` | Solution Detail | ✅ |
| `/codeeditor` | Standalone Code Editor | ✅ |
| `/calendar` | Contest Calendar | ✅ |
| `/rooms` | Room Lobby (Create/Join) | ✅ |
| `/rooms/:roomId` | Collaborative Room | ✅ |
| `/profile` | Your Profile | ✅ |
| `/user/:id` | Other User's Profile | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 👨‍💻 Author

<div align="center">

**Pachigolla Saikiran**

[![GitHub](https://img.shields.io/badge/GitHub-saikiran9346-181717?style=for-the-badge&logo=github)](https://github.com/saikiran9346)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ If you found this project useful, consider giving it a star! ⭐**

Made with ❤️ by [Pachigolla Saikiran](https://github.com/saikiran9346)

</div>
