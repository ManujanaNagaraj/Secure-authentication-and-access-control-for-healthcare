import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, Admin {user?.name}!</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {user?.role}</p>
          <p className="text-gray-500 text-sm mt-2">
            Member since: {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">156</div>
            <div className="text-gray-600 mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">42</div>
            <div className="text-gray-600 mt-2">Doctors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">102</div>
            <div className="text-gray-600 mt-2">Patients</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">12</div>
            <div className="text-gray-600 mt-2">Admins</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">User Management</h3>
            <p className="text-gray-600 mb-4">Add, edit, or remove system users</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Manage Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-green-600">Role Management</h3>
            <p className="text-gray-600 mb-4">Configure user roles and permissions</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Manage Roles
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-600">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system-wide settings</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Settings
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">Security Logs</h3>
            <p className="text-gray-600 mb-4">View system security and access logs</p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              View Logs
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-indigo-600">Audit Trail</h3>
            <p className="text-gray-600 mb-4">Track all system activities</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              View Audit Trail
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-pink-600">Reports</h3>
            <p className="text-gray-600 mb-4">Generate system reports</p>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
              Generate Reports
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Access Control</h3>
            <p className="text-gray-600 mb-4">Manage access control policies</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Manage Access
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-teal-600">Backup & Recovery</h3>
            <p className="text-gray-600 mb-4">Manage system backups</p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
              Manage Backups
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-600">Notifications</h3>
            <p className="text-gray-600 mb-4">Send system-wide notifications</p>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Send Notification
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Administrator Access Level
          </h3>
          <p className="text-red-800">
            As an administrator, you have full access to the system including user management,
            role configuration, security settings, audit trails, and system monitoring. Please
            use these privileges responsibly to maintain the security and integrity of the
            healthcare system.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
