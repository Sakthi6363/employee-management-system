# Employee Management System

A full-stack Employee Management System built with React + Vite (frontend) and Node.js + Express + MySQL (backend).

## Features

- **Authentication**: Register, Login, Logout with JWT
- **Role-Based Access**: Admin and User roles
- **Employee CRUD**: Create, Read, Update, Delete employees (Admin only)
- **Search & Filter**: Search by name/email/position, filter by department and status
- **Pagination**: Server-side pagination on all list views
- **User Management**: Admin can manage user roles (Admin only)
- **Protected Routes**: Frontend route guards based on auth and role

---

## Project Structure

```
employee-management/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── database.sql       # SQL schema + seed data
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verify + role check
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   └── user.routes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with interceptors
    │   ├── components/
    │   │   ├── DeleteConfirmModal.jsx
    │   │   ├── EmployeeModal.jsx
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state management
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Users.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup Instructions

### 1. Database Setup

1. Open MySQL and run the SQL file:
   ```sql
   source backend/config/database.sql
   ```
   Or paste the contents into MySQL Workbench / phpMyAdmin.

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key
```

Start the backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get current user profile |

### Employees (requires auth)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | /api/employees | List employees (search, filter, paginate) | All |
| GET | /api/employees/:id | Get single employee | All |
| GET | /api/employees/departments | Get department list | All |
| POST | /api/employees | Create employee | Admin |
| PUT | /api/employees/:id | Update employee | Admin |
| DELETE | /api/employees/:id | Delete employee | Admin |

### Users (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| PUT | /api/users/:id/role | Update user role |
| DELETE | /api/users/:id | Delete user |

---

## Default Admin Account

After running the SQL seed:
- **Email**: admin@example.com
- **Password**: password

> Change this password immediately in production!

---

## Tech Stack

**Frontend**: React 18, Vite, React Router v6, Axios, Bootstrap 5, Bootstrap Icons

**Backend**: Node.js, Express, MySQL2, JWT, bcryptjs, express-validator

**Database**: MySQL
