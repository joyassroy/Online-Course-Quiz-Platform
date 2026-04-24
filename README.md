# OCQP Platform - Online Course & Quiz Platform

OCQP is a modern, full-stack E-Learning platform built with the MERN stack (utilizing MySQL) and Next.js. It features a robust role-based access control system for Admins, Instructors, and Students, alongside a simulated local payment gateway for premium content.

## 🚀 Key Features

### 👤 For Students
- **Dynamic Course Explorer:** Filter courses by category, difficulty level, and price (Free/Paid).
- **Smart Quick Preview:** Interactive sidebar to view curriculum and course details before enrolling.
- **bKash Payment Simulation:** A realistic dummy payment flow for premium courses with PIN-based confirmation.
- **Learning Dashboard:** Track enrolled courses and lesson progress.

### 👨‍🏫 For Instructors
- **Smart Upload System:** Course thumbnails and materials can be uploaded directly or linked via external URLs.
- **Course Management:** Create, edit, and delete courses. Status tracking (Draft -> Pending Review -> Published).
- **Instructor Dashboard:** Real-time stats on total students, average quiz scores, and course performance.

### 🛡️ For Admins
- **Global Oversight:** Manage all users (Admins, Instructors, Students) and roles.
- **Approval System:** Review and approve course submissions to ensure content quality.
- **Secure Architecture:** Super Admin protection (ID #1 is hidden from general user lists).

## 📊 Database Architecture

The platform uses a structured relational database to manage complex interactions between users, courses, and enrollments.

### ER Diagram
![OCQP ER Diagram](https://i.ibb.co.com/1J0DKrNj/Untitled-1.png)

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, DaisyUI, Lucide React.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL (Relational architecture for enrollments and quizzes).
- **Authentication:** JWT (JSON Web Tokens) with secure localStorage handling.

## 🌐 Hosting & Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Aiven

## 📁 Project Structure

```text
online-course-quiz-platform/
├── client/              # Next.js Frontend
│   ├── src/app/         # App Router pages (Dashboard, Courses, Explorer)
│   ├── src/components/  # Shared & UI components (Navbar, PaymentModal)
│   └── src/utils/       # API config & helpers
└── server/              # Express Backend
    ├── controllers/     # Business logic (Auth, Instructor, Admin)
    ├── middleware/      # Auth & Multer upload logic
    ├── utils/           # Configuration helpers
    └── routes/          # API endpoints

```
---

## 🔗 Project Links

- **🌐 Live Demo:** [OCQP Platform Live](https://online-course-quiz-platform.vercel.app/)
- **💻 Source Code:** [GitHub Repository](https://github.com/joyassroy/Online-Course-Quiz-Platform)

---

<div align="center">
  <h3><b>Designed & Developed by Joyassroy Barua</b></h3>
</div>
