# 🏛️ GovInfo Search Portal

A full-stack portal for searching official Indian government notifications across 15+ departments — built with React, Express, and MySQL.

**Live Departments:** UPSC · NTA · CBSE · UGC · PIB · SSC · DOPT · Income Tax · RBI · Railways · SEBI · Agriculture · Education · Finance · Health

---

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup for Friends (Step-by-Step)](#setup-for-friends-step-by-step)
- [Running the Project](#running-the-project)
- [Running the Scraper](#running-the-scraper)
- [API Reference](#api-reference)
- [Admin Credentials](#admin-credentials)
- [How to Edit on GitHub](#how-to-edit-on-github)

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite + React Router v6 |
| Styling   | Bootstrap 5 + Custom CSS          |
| Backend   | Node.js + Express 4               |
| Database  | MySQL 8.0                         |
| Scraper   | Axios + Cheerio                   |
| Auth      | JWT (jsonwebtoken + bcryptjs)      |
| AI Chat   | Google Gemini API                 |

---

## 📁 Project Structure

```
Government Info Portal/
├── backend/
│   ├── .env                  ← your local secrets (never committed)
│   ├── .env.example          ← template for others to copy
│   ├── database/
│   │   ├── schema.sql        ← run once to create tables
│   │   └── seed.sql          ← run once to populate sample data
│   ├── scraper/
│   │   └── scrape.js         ← standalone multi-dept scraper
│   ├── scripts/
│   │   └── fix-admin-password.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/db.js
│       ├── middleware/authMiddleware.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── search.js
│       │   ├── notifications.js
│       │   ├── admin.js
│       │   └── chat.js
│       └── utils/stopwords.js
├── frontend/
│   ├── .env                  ← frontend env (VITE_API_BASE_URL)
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── api/
└── README.md
```

---

## ✅ Prerequisites

Install these before starting:

| Tool        | Download Link                        | Version      |
|-------------|--------------------------------------|--------------|
| Node.js     | https://nodejs.org/                  | 18+ (LTS)    |
| MySQL       | https://dev.mysql.com/downloads/     | 8.0+         |
| Git         | https://git-scm.com/downloads        | any recent   |

---

## 🚀 Setup for Friends (Step-by-Step)

### Step 1 — Clone the repository

Open a terminal (Command Prompt or PowerShell) and run:

```bash
git clone https://github.com/ShriyaRao1/govinfo-search.git
cd govinfo-search
```

---

### Step 2 — Set up the MySQL Database

1. Open **MySQL Workbench** (or MySQL shell) and log in as root.

2. Create the database:
```sql
CREATE DATABASE govinfo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE govinfo_db;
```

3. Run the schema (creates tables):
```
source /path/to/govinfo-search/backend/database/schema.sql
```
> On Windows: `source C:/Users/YourName/govinfo-search/backend/database/schema.sql`

4. Run the seed file (adds sample data + admin user):
```
source /path/to/govinfo-search/backend/database/seed.sql
```

---

### Step 3 — Configure Backend Environment

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` in any text editor (Notepad, VS Code) and fill in:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=govinfo_db

JWT_SECRET=pick_any_long_random_string_here
JWT_EXPIRES_IN=7d

PORT=5000

GEMINI_API_KEY=your_gemini_api_key_here
```

> **Get a free Gemini API key** at: https://aistudio.google.com/app/apikey  
> (The chatbot won't work without it, but everything else will.)

---

### Step 4 — Install Backend Dependencies

```bash
# Inside the backend/ folder
npm install
```

---

### Step 5 — Configure Frontend Environment

```bash
cd ../frontend
copy .env.example .env
```

The default `frontend/.env` content is fine as-is:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

### Step 6 — Install Frontend Dependencies

```bash
# Inside the frontend/ folder
npm install
```

---

### Step 7 — Run the Project

Open **two separate terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see: `✅ MySQL connected successfully` and `🚀 Server running on port 5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `➜  Local:   http://localhost:5173/`

Open your browser at **http://localhost:5173** 🎉

---

### Step 8 — (Optional) Run the Scraper

To fetch the latest government notifications:

```bash
cd backend
node scraper/scrape.js
```

This pulls live data from UPSC, NTA, CBSE, UGC, PIB, SSC, RBI, SEBI, Railways, DOPT, and Income Tax websites. Safe to re-run — duplicates are skipped automatically.

---

## 🔑 Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | admin@govinfo.in   |
| Password | Admin@123          |
| Role     | admin              |

> Go to `/login` and use these credentials to access the Admin Dashboard at `/admin`.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                        | Auth? | Description                         |
|--------|---------------------------------|-------|-------------------------------------|
| GET    | `/health`                       | No    | Health check                        |
| GET    | `/search?q=UPSC`                | No    | Full-text search                    |
| GET    | `/search?q=exam&department=NTA` | No    | Search with department filter       |
| GET    | `/search/departments`           | No    | List all departments                |
| GET    | `/notifications/:id`            | No    | Get full notification by ID         |
| POST   | `/auth/register`                | No    | Register new user                   |
| POST   | `/auth/login`                   | No    | Login, returns JWT token            |
| GET    | `/admin/stats`                  | Admin | Dashboard statistics                |
| POST   | `/admin/notifications`          | Admin | Add notification (with PDF upload)  |
| POST   | `/chat`                         | No    | AI chatbot (Gemini)                 |

---

## ✏️ How to Edit on GitHub

### Method A — Edit directly on GitHub (small changes)

1. Go to **https://github.com/ShriyaRao1/govinfo-search**
2. Navigate to the file you want to edit (e.g. `backend/scraper/scrape.js`)
3. Click the **pencil icon ✏️** (top-right of the file view)
4. Make your changes in the editor
5. Scroll down to **"Commit changes"**
6. Write a short message describing what you changed
7. Click **"Commit changes"** (green button)

> After committing on GitHub, pull the changes locally:
> ```bash
> git pull origin main
> ```

---

### Method B — Edit locally and push (recommended for bigger changes)

```bash
# 1. Pull latest changes from GitHub first
git pull origin main

# 2. Make your edits in VS Code or any editor

# 3. Stage your changes
git add .

# 4. Commit with a message
git commit -m "describe what you changed"

# 5. Push to GitHub
git push origin main
```

---

### Common Git Commands Cheat Sheet

```bash
git status              # see what files have changed
git pull origin main    # get latest changes from GitHub
git add .               # stage all changes
git add filename.js     # stage a specific file
git commit -m "message" # save changes with a description
git push origin main    # upload to GitHub
git log --oneline -10   # see last 10 commits
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `EADDRINUSE: port 5000` | Another process is using port 5000. Close it or change `PORT` in `.env` |
| `Access denied for user 'root'` | Wrong MySQL password in `backend/.env` |
| Frontend shows blank / errors | Make sure backend is running first on port 5000 |
| Scraper inserts 0 rows | All scraped items already exist in DB (run is idempotent) |
| Admin login fails | Run `node backend/scripts/fix-admin-password.js` to reset |
| Gemini chat not working | Add a valid `GEMINI_API_KEY` to `backend/.env` |

---

## 📄 License

MIT — free to use, modify, and share.
