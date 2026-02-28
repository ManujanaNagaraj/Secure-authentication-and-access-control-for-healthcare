# API Documentation

## Overview

The Healthcare Security System provides a RESTful API for managing users, medical records, appointments, and prescriptions with role-based access control.

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token

## Authentication Endpoints

### Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "patient"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or validation errors
- `400 Bad Request` - User already exists
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Database connection unavailable

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `503 Service Unavailable` - Database connection unavailable

### Get Profile

Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Access:** Protected (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

## Patient Endpoints

All patient endpoints require authentication and patient role.

### Get Medical Records

**Endpoint:** `GET /api/patients/medical-records`

**Access:** Protected (Patient only)

**Response:** `200 OK`
```json
{
  "success": true,
  "records": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "diagnosis": "Common Cold",
      "treatment": "Rest and fluids",
      "date": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Appointments

**Endpoint:** `GET /api/patients/appointments`

**Access:** Protected (Patient only)

**Response:** `200 OK`
```json
{
  "success": true,
  "appointments": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "doctorName": "Dr. Smith",
      "date": "2024-02-01T14:00:00.000Z",
      "reason": "Follow-up checkup",
      "status": "scheduled"
    }
  ]
}
```

### Get Prescriptions

**Endpoint:** `GET /api/patients/prescriptions`

**Access:** Protected (Patient only)

**Response:** `200 OK`
```json
{
  "success": true,
  "prescriptions": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "medication": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days"
    }
  ]
}
```

## Doctor Endpoints

All doctor endpoints require authentication and doctor role.

### Get All Patients

**Endpoint:** `GET /api/doctor/patients`

**Access:** Protected (Doctor only)

### Get Patient Details

**Endpoint:** `GET /api/doctor/patients/:patientId`

**Access:** Protected (Doctor only)

### Update Medical Record

**Endpoint:** `PUT /api/doctor/medical-records/:recordId`

**Access:** Protected (Doctor only)

### Create Prescription

**Endpoint:** `POST /api/doctor/prescriptions`

**Access:** Protected (Doctor only)

## Admin Endpoints

All admin endpoints require authentication and admin role.

### Get All Users

**Endpoint:** `GET /api/admin/users`

**Access:** Protected (Admin only)

### Get Audit Logs

**Endpoint:** `GET /api/admin/audit-logs`

**Access:** Protected (Admin only)

### Get System Statistics

**Endpoint:** `GET /api/admin/statistics`

**Access:** Protected (Admin only)

## Chat Endpoints

### Send Chat Message

**Endpoint:** `POST /api/chat`

**Access:** Protected (Patient only)

**Request Body:**
```json
{
  "message": "What are my upcoming appointments?"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "response": "You have 2 upcoming appointments: 1) Dr. Smith on Feb 1st at 2:00 PM for Follow-up checkup..."
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Database connection unavailable

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Response:** `429 Too Many Requests`

## Authentication

### Using JWT Token

Include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5000/api/auth/profile
```

### Token Expiration

- Tokens expire after 7 days
- After expiration, user must log in again

## CORS

The API accepts requests from the configured CLIENT_URL (default: http://localhost:5173).

## Data Models

### User
```typescript
{
  _id: ObjectId
  name: string (2-50 chars)
  email: string (unique, lowercase)
  password: string (hashed, min 6 chars)
  role: 'patient' | 'doctor' | 'admin'
  createdAt: Date
}
```

### Medical Record
```typescript
{
  _id: ObjectId
  patientId: ObjectId
  diagnosis: string
  treatment: string
  doctor: string
  date: Date
  notes: string
}
```

### Appointment
```typescript
{
  _id: ObjectId
  patientId: ObjectId
  doctorId: ObjectId
  doctorName: string
  date: Date
  time: string
  reason: string
  status: 'scheduled' | 'completed' | 'cancelled'
}
```

### Prescription
```typescript
{
  _id: ObjectId
  patientId: ObjectId
  doctorId: ObjectId
  medication: string
  dosage: string
  frequency: string
  duration: string
  date: Date
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test123!","role":"patient"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123!"}'
```

### Get Profile
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Support

For API issues or questions, please open an issue on GitHub or contact the development team.
