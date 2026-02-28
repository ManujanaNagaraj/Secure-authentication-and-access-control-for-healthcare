# Healthcare Security System - Admin Setup Guide

## Admin User Creation

This healthcare application includes a secure admin user creation script that allows you to set up administrative access.

### Default Admin Credentials

After running the admin creation script, use these credentials:

- **Email:** admin@health.com
- **Password:** Admin@123
- **Role:** admin

### Creating Admin User

Run the following command from the backend directory:

```bash
npm run create-admin
```

This will:
1. Connect to MongoDB
2. Delete any existing problematic admin users
3. Create a fresh admin user with the credentials above
4. Display confirmation with user details

### Security Notes

⚠️ **Important:** Change the default admin password immediately after first login in a production environment.

### Testing Admin Access

You can test the admin user by:

1. Logging in at http://localhost:5173/login
2. Using the credentials above
3. You should be redirected to /dashboard/admin

### Manual Admin Creation

If you prefer to create an admin user manually through the registration form:

1. Navigate to http://localhost:5173/register
2. Fill in the form
3. Select "Admin" from the role dropdown
4. Submit the form

The backend will automatically save the user with the 'admin' role.

## Role-Based Access Control

The application supports three roles:

- **patient** - Default role for regular users
- **doctor** - Medical professionals
- **admin** - System administrators

Each role has access to specific routes and features protected by the `ProtectedRoute` component.
