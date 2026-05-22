# AttendWise - MERN Student & Attendance Management System

AttendWise is a feature-rich, role-based Student Management System built using the MERN stack (MongoDB, Express, React, Node.js). It provides comprehensive workspaces for teachers to manage student directories, track class attendance logs, distribute assignments, and post announcements, while enabling students to view attendance analytics, submit coursework, and engage in academic discussion boards.

---

## 🏗️ Architecture Overview

The codebase is organized into a clean client-server architecture:

```mermaid
graph TD
    subgraph Client [Frontend - Vite React]
        A[App Router] --> B[Protected Routes]
        B --> C[Teacher Portal]
        B --> D[Student Portal]
        C --> C1[Student List]
        C --> C2[Attendance Sheet]
        C --> C3[Assignments Hub]
        C --> C4[Notices Board]
        D --> D1[Analytics Charts]
        D --> D2[Work Submissions]
        D --> D3[Notices Board]
    end
    
    subgraph Server [Backend - Express Node.js]
        E[API Gateway] --> F[Auth Middleware]
        F --> G[Auth Controller]
        F --> H[Student Controller]
        F --> I[Attendance Controller]
        F --> J[Assignment Controller]
        F --> K[Notice Controller]
    end

    subgraph Database [MongoDB Atlas]
        M1[(User Schema)]
        M2[(Attendance Schema)]
        M3[(Assignment Schema)]
        M4[(Submission Schema)]
        M5[(Notice Schema)]
    end

    Client -- HTTPS / JSON --> Server
    Server -- Mongoose Models --> Database
```

### Technical Stack:
* **Frontend**: React (Vite-powered), Tailwind CSS, Lucide React (Icons), React Router Dom (Routing), Recharts (Data Visualization).
* **Backend**: Node.js, Express.js (Rest API framework), JWT (Session Authentication), Multer (File Attachment Storage).
* **Database**: MongoDB Atlas using Mongoose ODM schemas.

---

## 🗃️ Database Schemas & Data Models

The backend model architecture resides in [`backend/src/models/`](file:///d:/Sai_Rakesh/Student_Mngmt_System/backend/src/models).

### 1. User Model (`User.js`)
Stores authentication data, credentials, and profile information for both teachers and students.
* **Fields**:
  - `name` (String, required)
  - `email` (String, unique, required)
  - `password` (String, bcrypt-hashed)
  - `role` (String: `'teacher'` or `'student'`)
  - `subject` (String - Teacher profiles only, e.g. `'Mathematics'`)
  - `rollNumber` (String - Student profiles only, unique identifier)
  - `class` (String - Student profiles only, e.g. `'Grade 10'`)

### 2. Attendance Model (`Attendance.js`)
Logs daily subject attendance sheets created by instructors.
* **Fields**:
  - `subject` (String, required)
  - `date` (Date, required)
  - `teacher` (ObjectId ref User, instructor who marked it)
  - `records` (Array of objects containing):
    - `student` (ObjectId ref User)
    - `status` (String: `'Present'` or `'Absent'`)

### 3. Assignment Model (`Assignment.js`)
Tracks tasks and study materials posted by teachers.
* **Fields**:
  - `title` (String, required)
  - `description` (String, required)
  - `subject` (String, required)
  - `teacher` (ObjectId ref User)
  - `deadline` (Date, automatically set to `23:59:59` on the deadline day)
  - `notes` (String, optional info)
  - `filePath` (String, server path to uploaded questions file)
  - `fileName` (String, name of attached document)
  - `comments` (Array of embedded user discussions containing user ref, comment text, and creation timestamp)

### 4. Submission Model (`Submission.js`)
Tracks homework, worksheets, and exam files uploaded by students.
* **Fields**:
  - `assignment` (ObjectId ref Assignment)
  - `student` (ObjectId ref User)
  - `filePath` (String, server path to uploaded answer file)
  - `fileName` (String, name of student work document)
  - `submittedAt` (Date, timestamp of submission)
  - `status` (String: `'Submitted'` or `'Late'`)

### 5. Notice Model (`Notice.js`)
Manages announcements posted by teachers to the public board.
* **Fields**:
  - `title` (String, required)
  - `content` (String, required)
  - `subject` (String, required)
  - `teacher` (ObjectId ref User)
  - `filePath` (String, optional attached reference document path)
  - `fileName` (String, optional attached filename)
  - `comments` (Array of public doubt-clearing discussions)

---

## 🌟 Key Application Features

### 📅 Simplified Deadlines & Input Cleanups
* When creating assignments, the time selector is hidden. The system automatically shifts the backend deadline hour to `23:59:59` local time on the designated date, giving students the entire day to upload submissions.

### 🇪🇺 Unified Date Format (`dd/mm/yyyy`)
* Standardized to the European/International date layout (`dd/mm/yyyy`) across the entire web application including dashboard trackers, notices timelines, comment sections, and student logs.

### 📥 Direct Document Downloads
* Both teachers and students can seamlessly upload and download worksheets, reference material, or submissions. Direct single-click download links are provided across Assignment lists, Notice bulletin boards, and Student Dashboards.

### 📊 Attendance Analytics Charts for Students
* Built-in analytics engine renders a subject-wise attendance bar chart inside the student portal.
* Automatically places a highlighted **75% warning line** to indicate if student attendance in specific subjects is lagging below threshold guidelines.

### 💬 Notice & Assignment Discussion Threads
* Notice boards and assignment modules are fully collaborative. Students and teachers can ask questions, clarify instructions, and leave comments directly beneath individual notice announcements and assignment cards.

---

## 🚀 Local Installation & Setup Guide

Follow these steps to run the application locally on your Windows environment:

### Prerequisites:
* **Node.js** (v18 or higher recommended)
* **MongoDB Atlas** account (or local MongoDB database instance)

### 1. Environment Configurations
Verify or create a `.env` file in the [`backend/`](file:///d:/Sai_Rakesh/Student_Mngmt_System/backend/) directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://saigemini5:ultimateprogrammer123@cluster0.gtt7pkr.mongodb.net/attendwise?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_token_for_attendwise_2026
NODE_ENV=development
```

### 2. Install Project Dependencies
Run from the root directory to install packages for the entire monorepo workspace:
```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Run Development Servers
Start both the backend Express API and Vite React client server concurrently from the root directory:
```bash
npm run dev
```

The terminal will launch the services:
* **Vite React UI**: [http://localhost:5173](http://localhost:5173)
* **Express REST API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Login Credentials

You can test user roles using the default mock accounts:

| Role | Username / Email | Password | Subject / Class |
| :--- | :--- | :--- | :--- |
| **Teacher** | `smith@teacher.com` | `password123` | Mathematics |
| **Student** | `john@student.com` | `password123` | Grade 10 / Roll: 101 |
