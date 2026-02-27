# Secure Authentication & Access Control for Healthcare Systems

A full-stack healthcare security system with role-based access control (RBAC) built for secure authentication and authorization.

## 🏥 Project Overview

This project implements a comprehensive security system for healthcare applications with:
- Secure user authentication using JWT
- Role-based access control (RBAC) for patients, doctors, and admins
- Protected routes and API endpoints
- Modern React frontend with Tailwind CSS
- RESTful API backend with Express.js

## 🚀 Features

### Authentication
- User registration with role selection
- Secure login with JWT tokens
- Password hashing using bcryptjs
- Token-based session management

### Authorization (RBAC)
- **Patient Role**: Access to personal medical records, appointments, and prescriptions
- **Doctor Role**: Access to patient records, appointment management, and prescription creation
- **Admin Role**: Full system access including user management, security logs, and system settings

### Security Features
- JWT token verification middleware
- Role-based authorization middleware
- Rate limiting to prevent abuse
- CORS configuration
- MongoDB connection security
- Password validation and hashing

## 📁 Project Structure

```
VIT/
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   └── authorizeRole.js
│   ├── config/
│   │   └── db.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running locally
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/healthcare-security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔐 API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Body: { name, email, password, role }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

#### Get Profile (Protected)
```
GET /api/auth/profile
Header: Authorization: Bearer <token>
```

### Health Check
```
GET /api/health
```

## 🎯 Usage

### Creating Accounts

1. **Register as Patient**: Navigate to `/register`, fill in details, select "Patient" role
2. **Register as Doctor**: Select "Doctor" role during registration
3. **Register as Admin**: Select "Admin" role during registration

### Dashboard Access

After login, users are automatically redirected to their role-specific dashboard:
- Patients → `/dashboard/patient`
- Doctors → `/dashboard/doctor`
- Admins → `/dashboard/admin`

### Protected Routes

The application uses a `ProtectedRoute` component that:
- Checks for valid JWT token in localStorage
- Verifies user role matches required role
- Redirects unauthorized users to login
- Redirects users to their appropriate dashboard if accessing wrong role's page

## 🔒 Security Best Practices Implemented

1. **Password Security**
   - Passwords hashed with bcryptjs (12 salt rounds)
   - Minimum password length validation
   - Passwords never stored in plain text

2. **JWT Security**
   - Tokens signed with secure secret
   - 7-day expiration
   - Automatic token refresh logic

3. **API Security**
   - Rate limiting on all API routes
   - CORS configuration
   - Input validation
   - Error handling middleware

4. **Frontend Security**
   - Protected routes with role checking
   - Automatic redirect on token expiration
   - Secure token storage in localStorage

## 🚦 Running in Production

### Backend Production Setup

1. Set `NODE_ENV=production` in `.env`
2. Use a strong, random `JWT_SECRET`
3. Use MongoDB Atlas or another hosted MongoDB service
4. Enable HTTPS
5. Configure proper CORS origins

### Frontend Production Build

```bash
cd frontend
npm run build
```

The build files will be in the `dist/` directory.

## 📝 Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

## 🤝 Contributing

This project was created for the hackathon. Feel free to fork and enhance!

## 📄 License

MIT License

## 👨‍💻 Author

**Manujana Nagaraj**

GitHub: [ManujanaNagaraj](https://github.com/ManujanaNagaraj)

## 🙏 Acknowledgments

- Built with modern web technologies
- Implements industry-standard security practices
- Designed for healthcare system security requirements

---

**Note**: This is a demonstration project for educational purposes. For production use, additional security measures and compliance with healthcare regulations (HIPAA, etc.) would be required.
