import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0
  });
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, alerts, logs, users, statistics, security
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user profile
      const userRes = await axios.get('http://localhost:5000/api/auth/profile', config);
      setUser(userRes.data.user);

      // Fetch all users
      const usersRes = await axios.get('http://localhost:5000/api/admin/users', config);
      setUsers(usersRes.data.data || []);
      setStats(usersRes.data.stats || {
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalAdmins: 0
      });

      // Fetch security alerts
      const alertsRes = await axios.get('http://localhost:5000/api/admin/security-alerts', config);
      setSecurityAlerts(alertsRes.data.data || []);

      // Fetch audit logs
      const logsRes = await axios.get('http://localhost:5000/api/admin/audit-logs?limit=100', config);
      setAuditLogs(logsRes.data.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const alertsRes = await axios.get('http://localhost:5000/api/admin/security-alerts', config);
      setSecurityAlerts(alertsRes.data.data || []);
      setSuccess('Alerts refreshed successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Error refreshing alerts:', error);
      setError('Failed to refresh alerts');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:5000/api/admin/alerts/${alertId}`, config);

      setSuccess('Alert marked as resolved!');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Error resolving alert:', error);
      setError(error.response?.data?.message || 'Failed to resolve alert');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        config
      );

      setSuccess('User role updated successfully!');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);

      setSuccess('User deleted successfully!');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'doctor':
        return 'bg-green-100 text-green-800';
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  const unresolvedAlerts = securityAlerts.filter(alert => !alert.resolved);
  const resolvedAlerts = securityAlerts.filter(alert => alert.resolved);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" userName={user?.name || 'Admin'} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System management and security monitoring</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'alerts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚨 Security Alerts
              {unresolvedAlerts.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 User Management
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Statistics
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔒 Security
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Patients</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
                  </div>
                  <div className="text-4xl">🏥</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Doctors</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalDoctors}</p>
                  </div>
                  <div className="text-4xl">👨‍⚕️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Alerts</p>
                    <p className="text-3xl font-bold text-red-600">{unresolvedAlerts.length}</p>
                  </div>
                  <div className="text-4xl">🚨</div>
                </div>
              </div>
            </div>

            {/* Quick Security Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary-700">🔒 Recent Security Alerts</h2>
                <button
                  onClick={handleRefreshAlerts}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  🔄 Refresh
                </button>
              </div>
              {unresolvedAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ✅ No unresolved security alerts
                </div>
              ) : (
                <div className="space-y-3">
                  {unresolvedAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold">{alert.userName}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(alert.role)}`}>
                              {alert.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(alert.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">⚠️ {alert.message}</p>
                          <div className="text-xs text-gray-600 space-x-3">
                            <span>Action: {alert.action}</span>
                            <span>IP: {alert.ipAddress}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {unresolvedAlerts.length > 5 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    View all {unresolvedAlerts.length} alerts →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
              <button
                onClick={handleRefreshAlerts}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                🔄 Refresh Alerts
              </button>
            </div>

            {/* Unresolved Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-700">
                🚨 Unresolved Alerts ({unresolvedAlerts.length})
              </h3>
              {unresolvedAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No unresolved alerts</p>
              ) : (
                <div className="space-y-3">
                  {unresolvedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-lg">{alert.userName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(alert.role)}`}>
                              {alert.role}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              alert.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-base font-medium mb-2">⚠️ {alert.message}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Action:</span> {alert.action}</div>
                            <div><span className="font-medium">IP Address:</span> {alert.ipAddress}</div>
                            <div><span className="font-medium">Endpoint:</span> {alert.endpoint}</div>
                            <div><span className="font-medium">Time:</span> {formatDate(alert.timestamp)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ✓ Mark as Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Alerts */}
            {resolvedAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">
                  ✓ Resolved Alerts ({resolvedAlerts.length})
                </h3>
                <div className="space-y-2">
                  {resolvedAlerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border bg-green-50 border-green-200 text-green-900 opacity-75"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{alert.userName}</span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">{alert.message}</span>
                          <span className="mx-2">•</span>
                          <span className="text-xs">{formatDate(alert.timestamp)}</span>
                        </div>
                        <span className="text-green-600 font-bold">✓ RESOLVED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary-700">📋 Audit Logs</h2>
            {auditLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No audit logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className={log.flagged ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(log.role)}`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {log.endpoint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.flagged ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              🚨 FLAGGED
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              ✓ Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary-700">👥 User Management</h2>
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u._id === user?._id ? (
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {u._id !== user?._id && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">📈 Statistics & Analytics</h2>
            
            {/* User Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">User Distribution by Role</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Patients', value: stats.totalPatients, color: '#3B82F6' },
                      { name: 'Doctors', value: stats.totalDoctors, color: '#10B981' },
                      { name: 'Admins', value: stats.totalAdmins, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Patients', value: stats.totalPatients, color: '#3B82F6' },
                      { name: 'Doctors', value: stats.totalDoctors, color: '#10B981' },
                      { name: 'Admins', value: stats.totalAdmins, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Growth Over Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">User Growth Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={(() => {
                    // Group users by date
                    const usersByDate = {};
                    users.forEach(u => {
                      const date = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      usersByDate[date] = (usersByDate[date] || 0) + 1;
                    });
                    
                    // Convert to cumulative data
                    let cumulative = 0;
                    return Object.entries(usersByDate)
                      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                      .map(([date, count]) => {
                        cumulative += count;
                        return { date, users: cumulative };
                      });
                  })()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Total Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Security Alerts Over Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Security Alerts Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={(() => {
                    // Group alerts by date
                    const alertsByDate = {};
                    securityAlerts.forEach(alert => {
                      const date = new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      alertsByDate[date] = (alertsByDate[date] || 0) + 1;
                    });
                    
                    return Object.entries(alertsByDate)
                      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                      .map(([date, count]) => ({ date, alerts: count }));
                  })()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} name="Security Alerts" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">🔒 Security Audit Logs</h2>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showFlaggedOnly}
                    onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700 font-medium">Show Flagged Only</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-700">📋 All Audit Logs</h3>
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No audit logs found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flagged</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs
                        .filter(log => !showFlaggedOnly || log.flagged)
                        .map((log) => (
                          <tr key={log._id} className={log.flagged ? 'bg-red-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.userName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(log.role)}`}>
                                {log.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.action}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.ipAddress}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {log.flagged ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                  🚨 YES
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  ✓ NO
                                </span>
                              )}
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
