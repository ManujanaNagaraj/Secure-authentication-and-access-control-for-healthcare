import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const DoctorDashboard = () => {
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
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
          <h2 className="text-xl font-semibold mb-2">Welcome, Dr. {user?.name}!</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {user?.role}</p>
          <p className="text-gray-500 text-sm mt-2">
            Member since: {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">Patient Records</h3>
            <p className="text-gray-600 mb-4">Access and manage patient medical records</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              View Patients
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-green-600">Appointments</h3>
            <p className="text-gray-600 mb-4">Manage your appointment schedule</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              View Schedule
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-600">Prescriptions</h3>
            <p className="text-gray-600 mb-4">Create and manage prescriptions</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Manage Prescriptions
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">Lab Results</h3>
            <p className="text-gray-600 mb-4">Review and update lab results</p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              View Lab Results
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-indigo-600">Consultations</h3>
            <p className="text-gray-600 mb-4">Video and chat consultations</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Start Consultation
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2 text-pink-600">Reports</h3>
            <p className="text-gray-600 mb-4">Generate medical reports</p>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
              Create Report
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Doctor Access Level
          </h3>
          <p className="text-green-800">
            As a doctor, you have access to patient medical records, appointment scheduling,
            prescription management, and lab results. You can also conduct secure
            consultations and generate medical reports.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
