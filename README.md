# PipelineCRM — Lead Management System

> A full-stack CRM application built for a small sales team to manage leads, track pipeline progress, log internal notes, and view live analytics.

---

## 📌 Project Overview

PipelineCRM is a Lead Management System built with the MERN stack (MongoDB, Express, React, Node.js). It gives a sales team one place to create and manage leads, move them through a sales pipeline, log internal notes after calls and meetings, and track performance through a real-time dashboard.

Every route is protected — users must log in to access anything. The dashboard pulls live data from MongoDB using aggregation pipelines, so all stats update automatically as leads are created and updated.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI component framework |
| Routing | React Router v6 | Client-side navigation and protected routes |
| Charts | Recharts | Bar and pie charts on the dashboard |
| HTTP Client | Axios | API calls with automatic JWT token injection |
| Styling | Custom CSS with CSS variables | Dark theme design system |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Document storage and schema validation |
| Auth | JWT + bcryptjs | Stateless authentication and hashed passwords |

---

## ✅ Features Implemented

### Authentication
- Email and password login with bcrypt password hashing
- JWT token returned on login, stored in localStorage
- Axios interceptor automatically attaches the token to every API request
- Auto-logout when token expires or is invalid
- Protected routes — unauthenticated users are redirected to the login page

### Lead Management (Full CRUD)
- Create leads with all required fields
- View all leads in a table sorted by last updated
- Click any lead to open the full detail page
- Edit any field via a modal form
- Delete leads with a confirmation prompt
- Quick inline status update on the detail page without reopening the form
- Created and last updated timestamps tracked automatically by MongoDB

Each lead stores: Lead Name, Company Name, Email, Phone, Lead Source, Assigned Salesperson, Status, Priority, Expected Close Date, and Estimated Deal Value.

### Lead Notes
- Add internal notes to any lead
- Each note shows the author name and a relative timestamp such as "2h ago"
- Delete your own notes — admins can delete any note
- Note count shown on the detail page

### Dashboard
- Total leads count
- New, Contacted, Qualified, Proposal Sent, Won, and Lost counts
- Total pipeline value across all leads
- Total won revenue
- Overall win rate percentage
- Bar chart showing lead count at each pipeline stage
- Pie chart showing lead count by source
- Team performance table with lead count, won deals, and pipeline value per salesperson
- Recent leads list with click-to-navigate

### Search and Filtering
- Live search by lead name, company name, or email
- Filter by Status
- Filter by Priority
- Filter by Lead Source
- Filter by Assigned Salesperson
- All filters work together simultaneously
- Active filter count shown with a one-click clear button
- Result count displayed in real time

### 🌟 Bonus Feature 1 — Lead Priority and Close Date
- Every lead has a Priority level: High, Medium, or Low
- Colour-coded priority badge — red for High, amber for Medium, grey for Low
- Expected Close Date field on every lead
- Close date badge automatically shows "7d left" in amber or "3d overdue" in red
- Overdue leads are highlighted with a red tint and a warning indicator in the leads table
- Leads that are Won or Lost are never marked overdue

### 🌟 Bonus Feature 2 — Export to CSV
- Export CSV button in the top right of the leads list
- Exports exactly what is currently filtered — if you filter to High priority Qualified leads, that is what downloads
- File is automatically named with today's date, for example leads-export-2026-05-07.csv
- Includes all columns: name, company, email, phone, source, status, priority, deal value, assigned salesperson, close date, created date, and last updated date

---

## 🗄 Database Setup

### Option A — MongoDB Atlas (Recommended, free, no install required)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a free M0 cluster
3. Under **Database Access** — add a new user with a username and password, grant "Read and write to any database"
4. Under **Network Access** — click Add IP Address and select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pipelinecrm
   ```
6. Replace `<username>` and `<password>` with the credentials you created
7. Paste this as the `MONGO_URI` value in `backend/.env`

### Option B — MongoDB Local

1. Download MongoDB Community from https://www.mongodb.com/try/download/community
2. Run the Windows MSI installer with default settings
3. Make sure "Install MongoDB as a Service" is checked — MongoDB will start automatically
4. Use `mongodb://localhost:27017/pipelinecrm` as your `MONGO_URI`

---

## ⚙️ Environment Variables

The `backend/.env` file is included in the repository for easy local setup. Edit it before running the backend:

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_username>:<db_password>@cluster0.jc3w1kf.mongodb.net/?appName=Cluster0
JWT_SECRET=crm-super-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the Express API runs on (default 5000) |
| `MONGO_URI` | MongoDB connection string — local or Atlas |
| `JWT_SECRET` | Secret used to sign JWT tokens — change this in production |
| `CLIENT_URL` | Allowed CORS origin for the React frontend |

> The `.env` file is included intentionally for easy local setup. In a real production project it would be in `.gitignore` and never committed to version control.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18 or higher — https://nodejs.org
- MongoDB (Atlas or local — see Database Setup above)

### Step 1 — Clone the repository
```bash
git clone https://github.com/your-username/pipeline-crm.git
cd pipeline-crm
```

### Step 2 — Configure the backend
Open `backend/.env` and set your `MONGO_URI` to either your Atlas connection string or your local MongoDB URI.

### Step 3 — Install and start the backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 API running at http://localhost:5000
```

### Step 4 — Seed the database (run once only)
Open a second terminal:
```bash
cd backend
node src/seed.js
```

You should see:
```
✅ Seeded 4 users and 10 leads with priority and close dates
```

### Step 5 — Install and start the frontend
Open a third terminal:
```bash
cd frontend
npm install
npm start
```

The browser will open automatically at http://localhost:3000

---

## 🔑 Test Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| sarah@example.com | password123 | Salesperson |
| marcus@example.com | password123 | Salesperson |
| priya@example.com | password123 | Salesperson |

---

## 🗂 Project Structure

```
pipeline-crm/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # Mongoose User schema with bcrypt pre-save hook
│   │   │   └── Lead.js          # Lead schema with embedded Note sub-documents
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification middleware and token generator
│   │   ├── routes/
│   │   │   ├── auth.js          # POST /login, GET /me, GET /users
│   │   │   ├── leads.js         # Full CRUD, notes endpoints, CSV export
│   │   │   └── dashboard.js     # MongoDB aggregation pipeline for stats
│   │   ├── seed.js              # One-time database seed script
│   │   └── index.js             # Express app entry point and Mongoose connection
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── Layout.js          # Sidebar navigation and page header shell
│       │   ├── LeadFormModal.js   # Reusable create and edit lead modal
│       │   └── Common.js          # StatusBadge, PriorityBadge, CloseDateBadge, formatters
│       ├── context/
│       │   └── AuthContext.js     # Global auth state via React Context
│       ├── pages/
│       │   ├── Login.js           # Login page
│       │   ├── Dashboard.js       # Analytics dashboard with charts
│       │   ├── Leads.js           # Lead list with search, filters, and CSV export
│       │   └── LeadDetail.js      # Lead detail view with notes and status control
│       ├── utils/
│       │   └── api.js             # Axios instance and all API call functions
│       ├── App.js                 # Router and protected route guards
│       ├── index.css              # CSS design system using custom properties
│       └── index.js              # React entry point
│
└── README.md
```

---

## 🔌 API Endpoints

All endpoints except `/api/auth/login` require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email and password, returns JWT |
| GET | `/api/auth/me` | Get the current authenticated user |
| GET | `/api/auth/users` | List all users for assigning leads |
| GET | `/api/leads` | List leads — supports search, status, source, assigned_to, priority filters |
| POST | `/api/leads` | Create a new lead |
| GET | `/api/leads/:id` | Get a single lead with all notes |
| PUT | `/api/leads/:id` | Update all fields on a lead |
| PATCH | `/api/leads/:id/status` | Update lead status only |
| DELETE | `/api/leads/:id` | Delete a lead and all its notes |
| POST | `/api/leads/:id/notes` | Add a note to a lead |
| DELETE | `/api/leads/:id/notes/:noteId` | Delete a specific note |
| GET | `/api/leads/export/csv` | Export filtered leads as a CSV file |
| GET | `/api/dashboard` | Get aggregated stats for the dashboard |

---

## 📐 Data Models

### User
```
_id, name, email, password (bcrypt hashed), role (admin or salesperson), createdAt, updatedAt
```

### Lead
```
_id, leadName, companyName, email, phone, leadSource, assignedTo (ref: User),
status, priority, closeDate, dealValue, createdBy (ref: User),
notes (embedded array), createdAt, updatedAt
```

### Note (embedded inside Lead)
```
_id, content, createdBy (ref: User), createdByName, createdAt, updatedAt
```

Notes are stored as embedded sub-documents inside each Lead document. This means fetching a lead with all its notes is always a single database query.

---

## ⚠️ Known Limitations

- **Not deployed** — runs locally only, no live URL for this submission
- **No pagination UI** — the API supports pagination parameters but the frontend fetches the first 50 results
- **No file attachments** — leads cannot have documents or images attached
- **No email integration** — notes are internal only, no outbound emails are sent
- **No real-time sync** — if two users are logged in simultaneously, changes from one will not appear for the other without a page refresh
- **JWT in localStorage** — acceptable for a development context, but a production app should use httpOnly cookies to protect against XSS
- **npm audit warnings on install** — these are in the react-scripts build toolchain, not in the running application code

---

## 💡 Reflection

**Why I chose the MERN stack**

I started this project with SQLite but hit a native compilation error on Windows — the `better-sqlite3` package requires Python and C++ build tools through node-gyp, which were not configured on my machine. Rather than spending time debugging the build environment I made the decision to switch to MongoDB, which is pure JavaScript and installs without any native dependencies. That was the right call because MongoDB's document model also turned out to be a better fit for this data — leads and their notes live in the same document, so reading a lead with its full history is always a single query.

**What I found challenging**

The biggest technical challenge was the dashboard aggregation pipeline. Grouping leads by status, summing deal values, and joining to the users collection to get per-salesperson stats all in one MongoDB query took the most iteration to get right. I kept getting the shape of the output wrong and had to work through the aggregation stages step by step.

I also ran into a naming convention issue early on — I designed the frontend field names in snake_case before realising Mongoose returns camelCase by default. I had to do a systematic find and replace across ten files. That taught me to decide on naming conventions before writing any code, not after.

**Design decisions**

I used React Context for authentication state rather than a third-party library like Redux or Zustand. The app is simple enough that Context is the right trade-off — adding a state management library would have been unnecessary complexity. I also built the CSS design system from scratch using custom properties rather than reaching for Tailwind, which forced me to think deliberately about the visual language instead of assembling utility classes.

**What I would add with more time**

- Kanban board view — drag and drop leads between pipeline stages visually
- Activity timeline — a full log of every status change, note, and edit on each lead with timestamps
- CSV import — bulk upload leads from a spreadsheet, not just export
- Lead enrichment — auto-fill company information from a third-party API like Clearbit or Hunter.io
- Email logging — connect to an inbox so emails to leads are automatically attached to their record
- Reminder scheduling — set a follow-up date on a lead and receive a notification when it is due

---
