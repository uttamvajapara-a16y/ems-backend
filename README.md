# Employee Management System — Backend

This is the backend API for an Employee Management System, built while learning the MERN stack. It handles authentication, employee records, attendance, leave requests, payroll, and a simple internal chat.

## Related Repositories

- **Frontend:** [employee-management-system-frontend](https://github.com/uttamvajapara-a16y/ems-frontend)

## Tech Stack

- Node.js + Express
- MongoDB with Mongoose
- JWT (stored in httpOnly cookies) for login sessions
- bcrypt for password hashing
- Socket.io for the chat feature
- Multer + Cloudinary for profile picture uploads
- PDFKit for generating payslip PDFs

## What This Project Does

- **Auth** — login for Admin, HR, and Employee, each stored in their own collection
- **Employee Management** — add, edit, view, and deactivate employees, with search/filter/pagination
- **Departments** — basic CRUD, used to group and filter employees
- **Attendance** — check-in/check-out, monthly history, and attendance reports for Admin/HR
- **Leave** — apply, cancel, and approve/reject leave requests, with a check that stops overlapping leave dates
- **Payroll** — generate monthly payroll (single or bulk), auto-calculates deductions from attendance, and lets employees download a PDF payslip
- **Audit Logs** — keeps a record of who created/updated/deleted what, so admins can see a history of changes
- **Dashboard** — a stats page with things like total employees, today's attendance, and pending leave count
- **Chat** — a simple company directory (grouped by department) with real-time 1-to-1 messaging

## A Few Things I Learned/Did Along the Way

- Since I used separate collections for Employee/HR/Admin instead of one combined `User` model, I had to use Mongoose's `refPath` to make `populate()` work correctly across different roles.
- Added a unique index on attendance (`employeeId` + `date`) so someone can't accidentally check in twice in one day, even if two requests happen at almost the same time.
- Built one reusable `roleAuth(...)` middleware instead of writing a separate middleware for every single role.
- Added an audit-log middleware that runs automatically after certain routes, instead of writing logging code inside every controller.
- Added an razorpay test mode payment to pay salary to employees(Admin/HR) and HR(Admin only)

## Project Structure

```
backend/
├── config/         # database connection, cloudinary setup
├── controllers/    # route logic
├── middleware/     # auth, role checks, audit logging, error handling, rate limiter
├── models/         # mongoose schemas
├── routes/         # express routes
├── utils/          # helper functions
├── app.js          # app entry point
└── seed.js         # Creating the first Admin account
```

## Getting Started

### You'll need
- Node.js
- A MongoDB database (local or Atlas)
- A Cloudinary account (for profile picture uploads)

### Setup

```bash
git clone https://github.com/uttamvajapara-a16y/ems-backend
cd backend
npm install
```

Create a `.env` file:

```env
PORT=6050
DATABASE_CONNECTION_STRING=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
FRONTEND_PRODUCTION_LINK=your_deployed_frontedn_link

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the server:

```bash
npm run dev
```

### Creating the first Admin account

Since accounts can only be created by an already-logged-in Admin/HR, there's no signup form for the very first Admin — I wrote a small seed script for that instead.

```bash
npm run seed
```

This clears any existing Admin records and creates one with:

```
Email:    admin@ems.com
Password: Admin@ems123
```

(Add `"seed": "node seed.js"` to your `package.json` scripts if it's not already there.)
