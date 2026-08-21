# 🚀 ServEase – Service Marketplace Platform

ServEase is a full-stack service marketplace where users can discover and book services, vendors can offer services, and admins manage approvals and bookings.

---

## 🌐 Live Demo

* 🔗 **Frontend (Live App):** https://ever-vice-lsf5xfy1i-diya-guptas-projects-a3dbf531.vercel.app/dashboard
* 🔗 **Backend API:** [https://your-backend.onrender.com](https://evervice-backend.onrender.com/)

---

## 🧠 Features

### 👤 User

* Browse services with filters (location, category, price)
* View detailed service pages
* Contact vendors / make bookings
* Signup & Login authentication

---

### 🧑‍💼 Vendor

* Request to become a vendor
* Get approved by admin
* Access vendor dashboard
* Add / delete services
* View booking requests

---

### 🛡️ Admin

* Approve / reject vendor requests
* View all bookings
* Manage platform workflow

---

## 🏗️ Tech Stack

### Frontend

* Next.js (React)
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas (Cloud Database)

### Authentication

* JWT (JSON Web Token)
* bcrypt (password hashing)

---

## 📂 Folder Structure

```id="sk75yq"
EverVice/
│
├── evervice-frontend/     # Next.js frontend
├── evervide-backend/      # Express backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
```

---

## 🔐 Environment Variables

### Backend (.env)

```id="6d3o8x"
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

---

### Frontend (.env.local)

```id="mnaxqb"
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 🚀 Deployment

### Backend (Render)

* Hosted on Render


* Uses MongoDB Atlas
* Auto-deployed from GitHub

---

### Frontend (Vercel)

* Hosted on Vercel
* Connected to backend via environment variable

---

## 🔄 Application Flow

```id="vqj1sd"
User Signup/Login
        ↓
User requests vendor access
        ↓
Admin approves request
        ↓
User becomes Vendor
        ↓
Vendor adds services
        ↓
Services appear on homepage
        ↓
Users book services
        ↓
Bookings visible to Admin & Vendor
```

---

## 🔐 Security Features

* JWT-based authentication
* Role-based access control (user / vendor / admin)
* Protected backend routes
* Secure password hashing using bcrypt

---

## 📌 Future Improvements

* Booking status (accept/reject by vendor)
* Notifications system
* Image upload for services
* Payment integration
* Ratings & reviews

---

## 👨‍💻 Author

Diya Gupta

---

## ⭐ Conclusion

EverVice is a real-world full-stack project demonstrating:

* Authentication & Authorization
* Role-based access (Admin / Vendor / User)
* Booking & service marketplace workflow
* Deployment-ready architecture

---
