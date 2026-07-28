Insurance Management Platform

A full-stack web application for managing insurance customers, policies, claims, premium payments, and documents — with role-based access for Administrators, Insurance Agents, and Customers.

Built with React + Tailwind CSS (frontend), Node.js + Express (backend), PostgreSQL + Prisma ORM (database), and JWT authentication.

Features
🔐 Role-based authentication (Admin / Agent / Customer) with JWT + bcrypt
👥 Customer management — register, search, edit, view full history
📄 Policy management — create, renew, cancel, expiry alerts, downloadable PDF certificates
📝 Claim management — submit, attach documents, assign to agents, approve/reject
💰 Premium tracking — record payments, due-date scheduling, overdue alerts, mock SMS + email reminders
📁 Document management — upload identity/policy/claim documents, download, categorize
📊 Reports dashboard — live charts (policy status, claims, premium collection, customer growth), filterable, exportable to PDF/Excel
🕵️ Audit logs — tracks every policy/claim create, update, cancel, approve, reject, and assign action
🌙 Dark mode
⚙️ System settings (Admin-configurable)
Tech Stack
Layer	Technology
Frontend	React.js (Vite)
Styling	Tailwind CSS
Backend	Node.js + Express.js
Database	PostgreSQL
ORM	Prisma
Auth	JWT + bcrypt
File Upload	Multer
Validation	express-validator
Charts	Chart.js (react-chartjs-2)
PDF Generation	PDFKit
Excel Export	SheetJS (xlsx)
Email	Nodemailer
Scheduled Jobs	node-cron
Folder Structure
insurance-platform/
├── backend/
│   ├── prisma/schema.prisma       # Database schema
│   ├── src/
│   │   ├── config/                # Prisma client
│   │   ├── middleware/             # Auth, role check, upload, validation, error handling
│   │   ├── controllers/            # Business logic per module
│   │   ├── routes/                 # Express routers per module
│   │   ├── utils/                  # Seed script, audit logger, email, cron job
│   │   ├── uploads/                # Uploaded files
│   │   └── server.js               # App entrypoint
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js            # API client (auto-attaches JWT)
    │   ├── context/                # Auth + theme state
    │   ├── components/             # Reusable UI (table, modal, pagination, etc.)
    │   ├── layouts/                 # Sidebar dashboard layout
    │   ├── pages/                   # One page per module
    │   └── App.jsx                  # Routes
    └── package.json
Prerequisites
Node.js 18 or higher
PostgreSQL installed and running locally (or a hosted instance)
Getting Started
1. Clone and set up the database
bash
git clone <your-repo-url>
cd insurance-platform
psql -U postgres -c "CREATE DATABASE insurance_db;"
2. Backend setup
bash
cd backend
npm install
cp .env.example .env

Edit .env with your own values:

env
DATABASE_URL="postgresql://postgres:<your_password>@localhost:5432/insurance_db?schema=public"
JWT_SECRET="<a long random string>"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"

# Optional — required only for real email reminders (not needed to run the app)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_email>
SMTP_PASS=<your_app_password>

Then run:

bash
npx prisma migrate dev --name init
npm run seed       # creates demo Admin, Agent, and Customer accounts
npm run dev        # starts the API at http://localhost:5000
3. Frontend setup

Open a new terminal:

bash
cd frontend
npm install
cp .env.example .env
npm run dev        # starts the app at http://localhost:5173

Visit http://localhost:5173 in your browser.

Demo Accounts

After running npm run seed, log in with (password for all: Password123!):

Role	Email
Admin	admin1@test.com
Agent	agent1@test.com
Customer	customer1@test.com

Or register your own customer account at /register.

Useful Commands
bash
npx prisma studio          # visual database browser (http://localhost:5555)
npx prisma migrate dev     # apply schema changes after editing schema.prisma
npx prisma generate        # regenerate Prisma client after schema changes
Roles & Permissions
Action	Admin	Agent	Customer
Register customers	✅	✅	Self only (via /register)
Create / renew / cancel policies	✅	✅	❌ (view own only)
Assign & approve/reject claims	✅	✅	❌ (submit own only)
View reports & export	✅	❌	❌
Manage employees & settings	✅	❌	❌
View audit logs	✅	❌	❌
API Overview

All routes are prefixed with /api and require a Bearer JWT token (except register/login).

Module	Base route
Auth	/api/auth
Customers	/api/customers
Policies	/api/policies
Claims	/api/claims
Premiums	/api/premiums
Documents	/api/documents
Reports	/api/reports
Settings	/api/settings
Audit Logs	/api/audit-logs

See Insurance-Management-Platform-Documentation.md in this repo for the full endpoint reference, database schema, and architecture notes.

Deployment
Component	Suggested platform
Database	Render PostgreSQL / Railway
Backend	Render / Railway
Frontend	Vercel

Set the same environment variables from your local .env files in each platform's dashboard, pointing CLIENT_URL (backend) and VITE_API_URL (frontend) at each other's deployed URLs.

License

This project was built for educational/internship purposes.