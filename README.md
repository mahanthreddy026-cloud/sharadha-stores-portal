# Sharadha Stores - Bulk Order & Corporate Gift Portal

A production-ready full-stack prototype application designed for **Sharadha Stores** to automate and manage bulk enquiries, custom quotations, administrative timeline workflows, customer payments verification, and logistics dispatch trackers.

---

## 🚀 Technology Stack

### Frontend Client
* **Core**: React.js (Vite compiler)
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM (v6)
* **Forms & Validation**: React Hook Form
* **HTTP Client**: Axios (with custom JWT authorization header interceptors)
* **Visuals & Charts**: Recharts & Lucide React Icons
* **Notifications**: React Toastify

### Backend Server
* **Core**: Node.js & Express.js
* **Authentication**: JWT (JSON Web Tokens) & Bcryptjs password hashing
* **Document Generator**: PDFKit (for styled PDF Quotations and invoices)
* **Notification Agent**: Nodemailer (integrated with a simulated logging system for development and standard SMTP support)
* **Validation**: Express Validator
* **Database Driver**: Unified wrapper supporting **MySQL** (production) and **SQLite** (frictionless local development)

---

## 📁 Project Folder Structure

```text
├── client/                     # Frontend Vite + React SPA
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, Sidebar, charts)
│   │   ├── context/            # AuthContext (JWT management)
│   │   ├── layouts/            # Page layouts (CustomerLayout, AdminLayout)
│   │   ├── pages/              # Views (Landing, Form, Track, Login, Admin Dashboard)
│   │   ├── services/           # Axios API services
│   │   └── main.jsx / index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json             # Vercel SPA routing & backend proxies
│
├── server/                     # Backend Express API
│   ├── config/                 # Database helper (SQLite/MySQL selector)
│   ├── controllers/            # Request handlers (auth, products, orders, dashboard)
│   ├── database/               # Relational MySQL DDL schema and seeds
│   ├── middleware/             # Route guards and JWT validators
│   ├── routes/                 # Express route mappings
│   ├── services/               # PDF generation and SMTP mailers
│   ├── tests/                  # Automated integration tests
│   ├── uploads/                # Directory for generated PDF invoices & images
│   ├── .env                    # Environment credentials template
│   └── server.js               # Express application entrypoint
│
└── README.md                   # Full system documentation
```

---

## ⚙️ Local Development Setup

### Prerequisite
Ensure [Node.js](https://nodejs.org/) (version 18 or above) is installed on your computer.

### Step 1: Install Dependencies
Open a terminal in the project root directory and execute:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Inside the `server/` directory, create or edit the `.env` file:
```env
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
JWT_SECRET=sharadha_jwt_secret_key_2026_super_secure

# Optional: Add SMTP credentials for real emails (Nodemailer logs simulations if empty)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

For **MySQL production setup**, change `DB_TYPE=mysql` and add your credentials:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=sharadha_portal
DB_PORT=3306
```

### Step 3: Run the Backend Server
From the `server/` directory:
```bash
npm start
```
*Note: In SQLite mode, the database file `sharadha.db` is automatically created under `server/database/` and seeded with categories, snacks, sweets, gift packages, and a default admin credentials account.*

* **Admin Username**: `admin`
* **Admin Password**: `admin123`

### Step 4: Run the React Frontend
Open a new terminal tab, navigate to the `client/` directory and execute:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Automated Testing

The backend includes a custom automated integration test suite that launches a mock server on port 5050 and verifies:
1. Category queries catalog.
2. Administrative authentication (JWT token receipt).
3. Client bulk order submissions with custom items.
4. Quotation setups, GST calculations, and PDF compiles.
5. Client payments recording and status timeline log shifts.

To execute tests, run:
```bash
cd server
npm test
```

---

## ☁️ Deployment Specifications

### 1. Frontend (Vercel)
Vercel handles React routing using the custom configuration in [vercel.json](file:///c:/Users/akhki/Desktop/Internship/client/vercel.json):
* Add environment variables to Vercel dashboard:
  * `VITE_API_URL` pointing to your deployed backend URL.

### 2. Backend (Render / Railway)
* **Render Environment Variables**:
  * Set `NODE_ENV=production`
  * Set `DB_TYPE=mysql`
  * Add your database host, user, password, and port matching your Railway instance.
  * Set `JWT_SECRET` to a secure hash.
* **Build Command**: `npm install`
* **Start Command**: `npm start`
