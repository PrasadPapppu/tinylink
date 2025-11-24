# TinyLink – URL Shortener

TinyLink is a lightweight Bit.ly-style URL shortener service with click statistics, link management, and clean UI.  
This project was built as a take-home assignment.

Live Demo: **https://tinylink-rose.vercel.app/**  
GitHub Repo: **https://github.com/PrasadPapppu/tinylink**

---

## 🚀 Features

### Core Functionality
- Create short URLs with custom codes  
- Redirect using `/:code` (302 redirect)  
- Track:
  - Total clicks
  - Last clicked time
- Delete links  
- View stats page `/code/:code`

### UI Features
- Dashboard with:
  - Add link form
  - Delete action
  - Table of all links
  - Real-time updates
- Stats page for each link
- Clean, minimal, responsive UI
- Error + loading states
- Long URL truncation (ellipsis)

---

## 🛠️ Tech Stack

### **Frontend**
- HTML5  
- CSS  
- Vanilla JavaScript (Fetch API)

### **Backend**
- Node.js  
- Express.js  
- Vercel Serverless Functions

### **Database**
- Neon PostgreSQL

### **Deployment**
- Vercel

---

## 📡 API Endpoints

### **Create Link**
