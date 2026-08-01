# Insurance Management Platform

A full-stack web application for managing insurance customers, policies, claims, premium payments, and documents — with role-based access for **Administrators**, **Insurance Agents**, and **Customers**.

Built with **React + Tailwind CSS** (frontend), **Node.js + Express** (backend), **PostgreSQL + Prisma ORM** (database), and **JWT authentication**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Roles & Permissions](#roles--permissions)
- [Project Objectives](#project-objectives)
- [Database Schema](#database-schema)
- [Core Modules](#core-modules)
- [Extra Features](#extra-features-added-beyond-the-original-spec)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)

---

## Overview

The workflow: an Administrator or Insurance Agent registers a customer and creates a policy. The customer logs in to view their policy, pay premiums, upload documents, and submit claims. Agents review and verify claims, then approve or reject them. Administrators monitor the whole business through dashboards, reports, and audit trails.

---

## Features

- 🔐 Role-based authentication (Admin / Agent / Customer) with JWT + bcrypt
- 👥 Customer management — register, search, edit, view full history
- 📄 Policy management — create, renew, cancel, expiry alerts, downloadable PDF certificates
- 📝 Claim management — submit, attach documents, assign to agents, approve/reject
- 💰 Premium tracking — record payments, due-date scheduling, overdue alerts, mock SMS + email reminders
- 📁 Document management — upload identity/policy/claim documents, download, categorize
- 📊 Reports dashboard — live charts, filterable, exportable to PDF/Excel
- 🕵️ Audit logs — tracks every policy/claim create, update, cancel, approve, reject, assign action
- 🌙 Dark mode
- ⚙️ Admin-configurable system settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| Validation | express-validator |
| Charts | Chart.js (react-chartjs-2) |
| PDF Generation | PDFKit |
| Excel Export | SheetJS (xlsx) |
| Email | Nodemailer |
| Scheduled Jobs | node-cron |

---

## Folder Structure

```
insurance-platform/
├── README.md
├── screenshots/                    # ← image files used by the links below
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/  middleware/  controllers/  routes/  utils/  uploads/
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/  context/  components/  layouts/  pages/
    │   └── App.jsx
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running

### 1. Clone and create the database
```bash
git clone <your-repo-url>
cd insurance-platform
psql -U postgres -c "CREATE DATABASE insurance_db;"
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev        # http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
```

---

## Demo Accounts

Password for all seeded accounts: `Password123!`

| Role | Email |
|---|---|
| Admin | admin1@test.com |
| Agent | agent1@test.com |
| Customer | customer1@test.com |  

**Note:** For the local development setup above, use `customer1@test.com` as shown. For the live Vercel deployment specifically, use `claimant1@test.com` / `Test1234` instead — this account was created via self-registration to ensure a properly linked customer profile in the production database.

---

## Roles & Permissions

| Action | Admin | Agent | Customer |
|---|---|---|---|
| Register customers | ✅ | ✅ | Self only |
| Create / renew / cancel policies | ✅ | ✅ | View own only |
| Assign & approve/reject claims | ✅ | ✅ | Submit own only |
| View reports & export | ✅ | ❌ | ❌ |
| Manage employees & settings | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |

---

## Project Objectives

| Objective | How it's met |
|---|---|
| Design enterprise-level web applications | Layered architecture: routes → controllers → database, separated frontend/backend |
| Implement role-based authentication | JWT-based login + role middleware on every sensitive route |
| Build secure REST APIs | bcrypt hashing, JWT tokens, input validation, centralized error handling |
| Design relational databases | PostgreSQL + Prisma, 9 related tables with foreign keys |
| Handle file uploads and document management | Multer-based upload, document categorization, secure download |
| Build workflow-based systems | Policy lifecycle and claim lifecycle (submit → verify → approve/reject) |
| Generate reports and dashboards | Chart.js visualizations + PDF/Excel export |
| Perform form validation and error handling | express-validator on every write endpoint + global error middleware |
| Deploy full-stack applications | Backend on Render, Frontend on Vercel |

---

## Database Schema

| Table | Key Fields | Notes |
|---|---|---|
| **User** | id, name, email, password, role | role: ADMIN / AGENT / CUSTOMER |
| **Customer** | id, userId, name, dob, phone, address, email | userId optional — Agent-registered customers may have no login yet |
| **Policy** | id, customerId, policyType, policyNumber, premiumAmount, startDate, endDate, status | status: ACTIVE / EXPIRED / CANCELLED |
| **Claim** | id, policyId, claimAmount, reason, status, assignedAgentId | status: PENDING / APPROVED / REJECTED |
| **PremiumPayment** | id, policyId, dueDate, paymentDate, amount, paymentStatus | paymentStatus: PAID / PENDING / OVERDUE |
| **Document** | id, customerId, claimId, documentType, fileName, filePath | documentType: IDENTITY / POLICY / CLAIM / OTHER |
| **Settings** | id, companyName, claimApprovalThreshold | Singleton admin-config table |
| **AuditLog** | entityType, entityId, action, performedBy, createdAt | Tracks every policy/claim action |
| **SmsLog / EmailLog** | policyId, message/subject, status, sentAt | Records mock SMS and real email attempts |

---

## Core Modules

**Customer Management** — register, view profile, edit information, search, view full history
**Policy Management** — create, view active, renew, cancel, expiry notifications, PDF certificate
**Claim Management** — submit, upload supporting documents, verification, approve/reject, history
**Premium Tracking** — record payments, payment status, due-date tracking, history, overdue alerts
**Document Management** — upload identity/policy documents, download, view uploaded files
**Reports Dashboard** — active/expired policies, claim statistics, premium collection, customer growth, monthly reports

---

## Extra Features Added Beyond the Original Spec

| Feature | Description |
|---|---|
| Audit Logs | Every policy/claim action recorded with who did it and when |
| Mock SMS Reminders | Simulated SMS reminder for due premiums, logged to the database |
| Email Notifications | Real email via Nodemailer + a daily cron job checking upcoming due payments |
| Advanced Analytics Filters | Reports filterable by policy type and date range |
| Dark Mode | App-wide theme toggle, persisted per browser |
| PDF/Excel Export | One-click business summary export as PDF or multi-sheet Excel workbook |

---

## API Reference

All routes are prefixed with `/api` and require a `Bearer` JWT token (except register/login).

| Module | Base route |
|---|---|
| Auth | `/api/auth` |
| Customers | `/api/customers` |
| Policies | `/api/policies` |
| Claims | `/api/claims` |
| Premiums | `/api/premiums` |
| Documents | `/api/documents` |
| Reports | `/api/reports` |
| Settings | `/api/settings` |
| Audit Logs | `/api/audit-logs` |

---

## Screenshots

Click any link below to open the full-size screenshot.

- [Claims Management (Admin view)](./screenshots/claims-page.png) — claims list showing status, attached documents, and the "Assigned To" agent dropdown
- [Premium Payments](./screenshots/premiums-page.png) — due-date tracking and the "Schedule due premium" action
- [Customer List](./screenshots/customers-list.jpg) — customer management page with search
- [Customer Profile & Policy History](./screenshots/customer-profile.jpg) — individual customer profile with policy history
- [Claim Documents](./screenshots/claim-documents.jpg) — documents uploaded and linked to a submitted claim
- [Claim Approval Workflow](./screenshots/claim-approved.jpg) — a claim assigned to an agent and marked APPROVED
- [Excel Report Export](./screenshots/excel-export.jpg) — exported business report opened in Excel


---

## Deployment

| Component | Platform |
|---|---|
| Database | Render PostgreSQL / Railway |
| Backend | Render / Railway |
| Frontend | Vercel |

Set the same environment variables from your local `.env` files in each platform's dashboard, pointing `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) at each other's deployed URLs.

---

## Future Enhancements

- QR code generation for instant policy verification
- OCR-based automatic data extraction from uploaded identity documents
- Multi-language interface support
- Automated test suite (Jest + Supertest)
- Real SMS gateway integration in place of the current mock

---

*Built as part of an internship project.*
