# GovInfo Search

A government notifications search portal — search exam results, scholarship schemes, and policy notifications from Indian government departments.

---

## Tech Stack

- **Frontend**: React + Vite, Axios, Bootstrap 5
- **Backend**: Node.js, Express.js, JWT, bcrypt
- **Database**: MySQL 8
- **PDF Processing**: pdf-parse
- **Scraper**: Axios + Cheerio

---

## Project Structure

```
Government Info Portal/
├── backend/              # Express REST API
│   ├── database/
│   │   ├── schema.sql    # Table definitions + FULLTEXT index
│   │   └── seed.sql      # 15-20 sample notifications + admin user
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/          # Temporary PDF storage (git-ignored)
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite SPA
│   ├── src/
│   ├── .env.example
│   └── package.json
├── scraper/              # Standalone Cheerio scraper
│   └── scrape.js
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm 9+

---

## Database Setup

1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create the database and run the schema:
   ```sql
   CREATE DATABASE govinfo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE govinfo_db;
   SOURCE backend/database/schema.sql;
   SOURCE backend/database/seed.sql;
   ```

   Or in one command from the project root:
   ```bash
   mysql -u root -p govinfo_db < backend/database/schema.sql
   mysql -u root -p govinfo_db < backend/database/seed.sql
   ```

---

## Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the env example and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`.

---

## Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the env example:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | *(empty)* |
| `DB_NAME` | Database name | `govinfo_db` |
| `JWT_SECRET` | Secret key for JWT signing | *(set a strong random string)* |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Express server port | `5000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |

---

## Default Admin Credentials (seeded)

| Field | Value |
|---|---|
| Email | `admin@govinfo.in` |
| Password | `Admin@123` |
| Role | `admin` |

> **Change this password** after first login in production.

---

## Running the Scraper

```bash
cd backend
node scraper/scrape.js
```

This fetches ~5 live notifications from a government site and inserts them into the database. They immediately appear in search results.

---

## Git Setup

```bash
# From the project root
git init
git add .
git commit -m "feat: initial project scaffold, schema, and seed data"

# Link to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/govinfo-search.git
git branch -M main
git push -u origin main
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/search?q=...&department=...` | None | Full-text search |
| GET | `/api/notifications/:id` | None | Single notification |
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login, get JWT |
| GET | `/api/admin/stats` | Admin JWT | Dashboard stats |
| POST | `/api/admin/notifications` | Admin JWT | Add notification + PDF |
