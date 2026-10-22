# 🏨 Hostel Management System (HMS)

The **Hostel Management System** is a modern full-stack web application designed to streamline and digitize hostel operations for universities and residential institutions. Built with **Node.js, Express, MySQL, and vanilla JavaScript**, the platform replaces outdated manual paperwork by centralizing room allocation, student welfare, discipline, grievance handling, and facility operations into unified, role-based dashboards.

---

## 🚀 Key Features

### 👤 Role-Based Portals (RBAC)
* **Admin Portal:** Manage hostel buildings, room configurations, user roles, facility maintenance pipelines, system analytics, and data exports.
* **Warden Portal:** Oversee room allocations, track student records, manage disciplinary actions (DC), and review/approve student leave and outing permissions.
* **Student Portal:** Browse available rooms, submit booking requests, apply for outing passes, log maintenance complaints, and check daily mess menus.
* **Mess Owner Portal:** Publish and update weekly meal schedules across breakfast, lunch, snacks, and dinner.

### ⚡ Core Capabilities
* **Room & Occupancy Management:** Real-time visibility into bed and room availability across multiple hostels.
* **Leave & Outing Approval Workflow:** Digital pass requests with warden review, timestamp logging, and automated status updates.
* **Maintenance & Grievance Pipeline:** Systematic complaint logging with priority categories and status tracking.
* **Secure Authentication:** JWT-based stateless authentication with password hashing using bcrypt.
* **Automated Email Dispatch:** SMTP integration (Nodemailer) for password resets, outing notifications, and critical alerts.

---

## 🛠 Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Modern Glassmorphic UI)
* **Backend:** Node.js, Express.js
* **Database:** MySQL / MariaDB (Relational schema with foreign key constraints)
* **Authentication:** JSON Web Tokens (JWT), bcrypt
* **Mail Service:** Nodemailer (SMTP)

---

## 📁 Project Structure

```
Hostel-Management-System/
├── backend/
│   ├── config/             # Database connection & config
│   ├── controllers/        # Route logic for auth, rooms, outings, complaints, mess
│   ├── middleware/         # JWT authentication & role-verification middleware
│   ├── routes/             # RESTful API endpoints
│   ├── services/           # Email service (Nodemailer)
│   ├── .env.example        # Environment variables template
│   ├── package.json        # Backend dependencies & scripts
│   └── server.js           # Server entry point
├── frontend/
│   ├── css/                # Styling and responsive design system
│   ├── js/                 # Client-side controllers and auth services
│   ├── views/              # Role-specific HTML views (Admin, Warden, Student, Mess)
│   └── index.html          # Main landing / portal entry
├── database/
│   ├── schema.sql          # Database tables and constraints
│   ├── erd.mmd             # Mermaid Entity-Relationship diagram
│   └── erd.png             # Visual database ER diagram
├── run_app.sh              # Unix launch script
├── run_app.bat             # Windows launch script
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/namandugar14/Hostel-Management-System.git
cd Hostel-Management-System
```

### 2. Configure Environment Variables

Navigate to the `backend/` directory, copy the example environment file, and adjust your database and SMTP settings:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=svkm_hostel_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here

# Optional SMTP Settings (for password resets & email alerts)
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 3. Setup Database

Import the database schema into MySQL:

```bash
mysql -u root -p < ../database/schema.sql
```

*(Optional migrations and seeders are available in `backend/` to populate dummy hostels, rooms, and users).*

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Application

```bash
npm start
# or run directly with: node server.js
```

Open your browser and navigate to:
```
http://localhost:5001
```

---

## 👨‍💻 Author

**Naman Dugar**  
* GitHub: [@namandugar14](https://github.com/namandugar14)
* Email: [namandugar2006@gmail.com](mailto:namandugar2006@gmail.com)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

⭐ If you find this project useful, feel free to star the repository!
