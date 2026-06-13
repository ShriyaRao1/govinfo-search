# 🧪 GovInfo Search — Manual Testing Guide

> This guide walks you through testing every feature of the GovInfo Search portal step by step.
> Share this link with anyone who needs to test: **https://github.com/ShriyaRao1/govinfo-search/blob/main/TESTING_GUIDE.md**

---

## 🚀 Step 0 — Start Both Servers

Open **two separate terminals** before testing anything.

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
✅ You must see:
```
✅ MySQL connected successfully
🚀 GovInfo API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
✅ You must see:
```
➜  Local:   http://localhost:5173/
```

Now open your browser at **http://localhost:5173**

---

## TEST 1 — Home Page Loads ✅

**Go to:** `http://localhost:5173`

| What to check | Expected |
|---|---|
| Blue hero banner | Shows "🏛️ GovInfo Search" |
| Search input | Visible and auto-focused |
| Department dropdown | Shows "All Departments" |
| Department pills | UPSC, NTA, CBSE, UGC, RBI etc. appear |
| 4 category cards | Exams, Scholarships, Agriculture, Health |

---

## TEST 2 — Search Feature ✅

| Action | URL it goes to | Expected result |
|---|---|---|
| Type `UPSC` → click Search | `/search?q=UPSC` | 40+ notification cards |
| Type `NEET 2024` → Search | `/search?q=NEET+2024` | NEET-related cards |
| Type `xyzgarbage123` → Search | `/search?q=xyzgarbage123` | "No results" — no crash |
| Clear box → click Search | `/search` | Latest 50 notifications |
| Select `NTA` dept + type `exam` | `/search?q=exam&department=NTA` | Only NTA results |
| Click `CBSE` department pill | `/search?department=CBSE` | Only CBSE results |
| Click "Scholarships" category card | `/search?q=scholarship` | Scholarship notifications |

---

## TEST 3 — Notification Detail Page ✅

From any search result, **click a notification card**.

| What to check | Expected |
|---|---|
| URL format | `/notifications/42` (any number) |
| Title shown | Large heading at top |
| Department + date | Shown below title |
| Full description | Main body text |
| Source link | Opens official govt website in new tab |
| Go to `/notifications/99999` | "Not found" message — no crash |
| Go to `/notifications/abc` | Error shown — no crash |

---

## TEST 4 — API Endpoints (in Browser Address Bar) ✅

Paste each URL into a new browser tab and check the response:

**Health check:**
```
http://localhost:5000/api/health
```
Expected: `{"status":"ok","timestamp":"..."}`

**Search:**
```
http://localhost:5000/api/search?q=UPSC
```
Expected: JSON with `results` array

**All departments:**
```
http://localhost:5000/api/search/departments
```
Expected: `{"success":true,"departments":["CBSE","DOPT","Income Tax Department",...]}`

**Single notification:**
```
http://localhost:5000/api/notifications/1
```
Expected: Full notification with title, description, department, source_url

**Unknown route:**
```
http://localhost:5000/api/this-does-not-exist
```
Expected: `{"success":false,"message":"Route GET /this-does-not-exist not found"}`

**Admin without login (should be blocked):**
```
http://localhost:5000/api/admin/stats
```
Expected: `{"success":false,"message":"No token provided. Please log in."}`

---

## TEST 5 — Register New Account ✅

**Go to:** `http://localhost:5173/register`

**Valid registration — fill in:**
- Name: `My Friend`
- Email: `myfriend@test.com`
- Password: `Hello@123`
- Click **Register**
- ✅ Expected: Logged in automatically, name shown in navbar

**Error cases:**

| Input | Expected error message |
|---|---|
| Same email again | "An account with this email already exists" |
| Password: `abc` (too short) | "Password must be at least 6 characters" |
| Email: `notanemail` | "Invalid email address" |
| Leave name empty | "Name, email, and password are required" |

---

## TEST 6 — Login & Logout ✅

**Go to:** `http://localhost:5173/login` (logout first if needed)

**Error cases:**

| Email | Password | Expected |
|---|---|---|
| `admin@govinfo.in` | `wrongpassword` | "Invalid email or password" |
| `nobody@x.com` | `anything` | "Invalid email or password" |
| *(both empty)* | — | "Email and password are required" |

**Successful login:**
- Email: `myfriend@test.com` / Password: `Hello@123`
- ✅ Expected: Name shown in navbar

**Logout:**
- Click **Logout** in navbar
- ✅ Expected: Name disappears, back to guest state

---

## TEST 7 — Admin Login & Dashboard ✅

**Go to:** `http://localhost:5173/login`

**Admin credentials:**
| Field | Value |
|---|---|
| Email | `admin@govinfo.in` |
| Password | `Admin@123` |

✅ After login: "Admin Dashboard" link appears in navbar (only for admins)

**Go to:** `http://localhost:5173/admin`

| Dashboard section | Expected |
|---|---|
| Total Notifications | ~1065 |
| Total Users | 6+ |
| Added this week | Recent number |
| By department table | All 15 departments listed with counts |

---

## TEST 8 — Admin: Add a Notification ✅

On the Admin Dashboard, find the **Add Notification** form.

**Fill in:**
```
Title:          Manual Test Notification June 2026
Description:    Testing the add notification feature manually.
Department:     UPSC
Source URL:     https://upsc.gov.in
Published Date: 2026-06-13
PDF:            (leave empty for now)
```
Click **Add Notification**
✅ Expected: Success message

**Verify it appears in search:**
Go to `http://localhost:5173/search?q=manual+test+notification`
✅ Expected: Your new notification card is visible

**Test with PDF upload:**
- Fill form again with a different title
- Attach any PDF file from your computer
- Submit
- ✅ Expected: Success + PDF content becomes searchable

---

## TEST 9 — Route Protection ✅

| Action | Expected |
|---|---|
| Logout → go to `http://localhost:5173/admin` | Redirected to `/login` automatically |
| Login as normal user → go to `/admin` | Redirected away, dashboard never shown |
| Go to `http://localhost:5173/random-page` | "404 — Page Not Found" with Go Home button |
| Call `/api/admin/stats` without token | `{"success":false,"message":"No token provided"}` |

---

## TEST 10 — AI Chatbot ✅

Find the **💬 chat bubble** at the bottom-right of the page. Click it.

| What to type | Expected response |
|---|---|
| `Tell me about NEET 2024` | Cites actual notification titles + dates from database |
| `What UPSC exams are available?` | Lists UPSC notifications from database |
| `What is the latest RBI interest rate?` | Says "I couldn't find this in our database, but..." + web answer |
| Ask a follow-up question | AI remembers context from previous message |
| Click X to close → reopen | Widget closes and reopens cleanly |

> ⚠️ If you see "GEMINI_API_KEY is not set" — the `.env` file is missing the API key.
> Get a free key at: https://aistudio.google.com/app/apikey

---

## TEST 11 — Web Scraper ✅

Open a terminal in the backend folder and run:

```bash
node scraper/scrape.js
```

**Expected output:**
```
══════════════════════════════════════════════════════
  GovInfo Search — Full Multi-Department Scraper
══════════════════════════════════════════════════════

🌐 Scraping all live sources in parallel…
   ✅ [UPSC] 8 live items
   ✅ [NTA] 12 live items
   ✅ [PIB] 4 live items
   ⚠️  [SSC] 0 live items     ← OK if website is down
   ...

── Total pool: XX candidates

   ✅ INSERT #1066 [UPSC] "UPSC Civil Services..."
   ⏭  SKIP  [NTA] "JEE Main 2024..."  ← already exists

  Done. Inserted: X  |  Skipped (duplicates): Y
```

**Run it a second time immediately:**
```bash
node scraper/scrape.js
```
✅ Expected: `Inserted: 0 | Skipped: (all)` — completely safe to re-run anytime

---

## TEST 12 — Database Counts Match ✅

Run this in the backend folder to verify:

```bash
node -e "
require('dotenv').config({path:'./.env'});
const db = require('./src/config/db');
Promise.all([
  db.query('SELECT COUNT(*) as n FROM Notification'),
  db.query('SELECT COUNT(*) as n FROM User'),
  db.query('SELECT department, COUNT(*) as n FROM Notification GROUP BY department ORDER BY n DESC')
]).then(([[notif],[users],[depts]])=>{
  console.log('Total Notifications:', notif[0].n);
  console.log('Total Users:', users[0].n);
  console.log('\\nBy Department:');
  depts.map(r => console.log(' ', r.department, ':', r.n));
  process.exit(0);
});
"
```

✅ Expected: Numbers match what the Admin Dashboard shows

---

## ✅ Final Checklist

Copy this and tick off each item:

```
□ Home page loads with search bar and department pills
□ Searching "UPSC" returns 40+ results
□ Searching "xyzgarbage" shows no results (no crash)
□ Empty search shows all 50 latest notifications
□ Department filter (NTA + "exam") shows only NTA results
□ Clicking a notification opens its detail page
□ /notifications/99999 shows not found message
□ /api/health returns {"status":"ok"}
□ /api/admin/stats is blocked without a token
□ Registering a new account works
□ Duplicate email gives correct error
□ Short password gives correct error
□ Login with wrong password gives error
□ Admin login works (admin@govinfo.in / Admin@123)
□ Admin dashboard shows stats
□ Add notification form works without PDF
□ Add notification works with PDF upload
□ New notification appears in search
□ /admin redirects to login when logged out
□ Normal user cannot access /admin
□ 404 page shows for unknown URL
□ Chatbot answers from DB for known topics
□ Chatbot uses web search for unknown topics
□ Scraper runs and inserts new items
□ Re-running scraper skips all duplicates (Inserted: 0)
□ DB counts match admin dashboard numbers
```

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| Home page blank / spinning | Backend not running — check Terminal 1 |
| Department pills not loading | Backend crashed — check for error in Terminal 1 |
| "EADDRINUSE port 5000" | Port busy — close other terminals or change PORT in `.env` |
| "Access denied for user root" | Wrong MySQL password in `backend/.env` |
| Admin login fails | Run `node backend/scripts/fix-admin-password.js` |
| Chatbot says "API key not set" | Add `GEMINI_API_KEY` to `backend/.env` |
| Scraper inserts 0 rows | All items already in DB — this is correct behaviour |
| PDF upload fails | Check file is PDF and under 10 MB |

---

*GovInfo Search — Government Notifications Portal*
*GitHub: https://github.com/ShriyaRao1/govinfo-search*
