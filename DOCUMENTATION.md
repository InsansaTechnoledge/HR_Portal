# HR Portal Documentation

## 1. Project Overview

The **HR Portal** is a comprehensive Human Resource Management System designed to streamline organizational processes. It bridges the gap between employees, administration, and finance departments by providing a unified platform for:

- **Recruitment**: Managing job postings, candidates, and applications.
- **Employee Management**: storing employee details, documents, and profiles.
- **Leave Management**: Tracking leave balances and history.
- **Payroll & Expenses**: Generating payslips and tracking reimbursements.
- **Document Management**: Securely uploading and serving documents.

## 2. Technology Stack

### Frontend

- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS for responsive and modern UI.
- **Routing**: `react-router-dom` for client-side navigation.
- **State Management**: React Context API (`userContext`) for authentication state.
- **Animations**: `framer-motion` and `react-tilt` for interactive UI elements.
- **Utilities**: `axios` for API requests, `jspdf` for PDF generation.

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-only cookies.
- **File Storage**: Multer (with Cloudinary storage integration).
- **Security**: `helmet`, `cors`, `bcryptjs` for password hashing.
- **Email**: Nodemailer for notifications.

## 3. Architecture & Workflow

The application follows a **Client-Server** architecture:

1.  **Frontend (Client)**:

    - Located in `/HRPortal`.
    - Communicates with the backend via RESTful APIs.
    - Base API URL: `http://localhost:3000` (Dev) / `https://hrportal.insansa.com` (Prod).
    - Authentication state is managed via Context. On load, it checks for an existing session (`/checkCookies`).

2.  **Backend (Server)**:

    - Located in `/Backend`.
    - Exposes API endpoints under `/api/`.
    - Connects to MongoDB Atlas/Local instance.
    - Integrates with Google Drive and Cloudinary for file management.

3.  **Authentication Flow**:
    - User submits credentials on Login page.
    - Backend validates against `User` collection.
    - On success, a JWT is signed and sent as a `token` cookie.
    - Protected Routes in Frontend check for this user context before rendering.

## 4. Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Connection String (in `.env`)
- Cloudinary Credentials (in `.env`)

### Installation Steps

#### Backend

1.  Navigate to the backend directory:
    ```bash
    cd Backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file with the following keys:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    ```
4.  Start the server:
    ```bash
    npm start
    ```

#### Frontend

1.  Navigate to the frontend directory:
    ```bash
    cd HRPortal
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 5. Features & Functionality

### User Roles & Access

The system recognizes multiple roles, handled by Route guards:

- **Employee**: Standard access (Profile, Leave, Documents).
- **Admin**: Recruitment and Employee onboarding.
- **Super Admin**: Full system control.
- **Accountant**: Payroll and Expense management.

### Key Modules

#### 1. Recruitment (Admin)

- **Job Posting**: Admins can create new job openings with descriptions and salary ranges.
- **Candidate Registration**: Manual entry of candidate details.
- **Applications**: Tracking of job applications and candidate status.

#### 2. Employee Management

- **Onboarding**: Admins add new employees (`/add-employee`), which creates a User account and Employee record.
- **Profile**: Employees can view their details (`/user-profile`) and change passwords.
- **Document Management**: Upload and view mandatory documents (`/docs`).

#### 3. Leave Management

- **Leave Tracker**: Visual dashboard for applying for leave.
- **Balances**: Tracks Vacation, Sick, and Personal leave balances.
- **History**: Logs all past leave requests.

#### 4. Payroll (Accountant/Super Admin)

- **Payslip Generator**: Generate and download monthly payslips as PDFs.
- **Expense Tracker**: Employees submit expenses; Accountants review and approve.

## 6. Schema Design

The Database is built on **MongoDB**. Key collections include:

### `User`

_Authentication and System Access_

- `userId`: Unique numerical ID.
- `userName`, `userEmail`, `password` (hashed).
- `role`: String (e.g., "admin", "employee").
- `leaveHistory`: Embedded array of leave records.

### `Employee`

_Professional Details_

- `empId`: Unique Employee ID.
- `name`, `email`, `department`.
- `totalLeaveBalance`: Object `{ vacation, sickLeave, personalLeave }`.
- `details`: Embedded personal details (Address, DOB, etc.).
- `payslips`: Array of references to `Payslip` documents.

### `Job`

_Job Openings_

- `jobId`: Unique ID.
- `jobTitle`, `jobLocation`, `jobDescription`.
- `skills`: Array of strings.
- `salaryRange`.

### `Applicant`

_Candidate Profiles_

- `name`, `email`, `phone`, `resume` (link).
- `applications`: References to `JobApplication`.

### `Leave` (Schema)

- Shared schema used in User/Employee documents to track leave start/end/reason.

## 7. API Documentation (Key Endpoints)

### Authentication

- `POST /api/auth/login`: Authenticate user.
- `GET /api/auth/checkCookies`: Verify current session.

### Employee Operations

- `GET /api/employee`: List all employees.
- `POST /api/employee`: Add a new employee.
- `GET /api/employee/:id`: Get details of a specific employee.

### Job Operations

- `GET /api/job`: List all job postings.
- `POST /api/job`: Create a new job posting.

### Payroll & Expenses

- `POST /api/payslip/`: Generate/Upload a payslip.
- `GET /api/expense`: List expense claims.
- `POST /api/expense`: Submit a new expense claim.

### Documents

- `POST /api/documents/upload`: Upload a file (handled via Multer/Cloudinary).

---

