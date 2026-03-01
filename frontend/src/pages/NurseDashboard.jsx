import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient-care');
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'patient-care') {
     fetchPatients();
    } else if (activeTab === 'medications') {
      fetchMedications();
    }
  }, [activeTab]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/nurse/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/nurse/medications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedications(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleAdministerMedication = async (medId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/nurse/medications/${medId}/administer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Medication marked as administered');
      fetchMedications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to administer medication');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        { message: chatInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = { role: 'assistant', content: response.data.message };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patient-care', label: 'Patient Care', icon: '👥' },
    { id: 'medications', label: 'Medications', icon: '💊' },
    { id: 'chat', label: 'Chat with NurseBot', icon: '🤖' },
    { id: 'logout', label: 'Logout', icon: '🚪' }
  ];

  const handleSidebarClick = (id) => {
    if (id === 'logout') {
      handleLogout();
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={handleSidebarClick}
        role="nurse"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Nurse Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').name}</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Active Patients</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{patients.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Today's Medications</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{medications.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700">Pending Doses</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {medications.filter(m => !m.administered).length}
                </p>
              </div>
            </div>
          )}

          {/* Patient Care */}
          {activeTab === 'patient-care' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Patient Care</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : patients.length === 0 ? (
                  <p className="text-center text-gray-500">No active patients</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checkup</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                          <tr key={patient._id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {patient.patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{patient.roomNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{patient.doctorName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {patient.currentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {new Date(patient.lastCheckup).toLocaleString()}
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

          {/* Medications */}
          {activeTab === 'medications' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Today's Medication Schedule</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Loading...</p>
                ) : medications.length === 0 ? (
                  <p className="text-center text-gray-500">No medications scheduled for today</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medications.map((med) => (
                          <tr key={med._id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {med.patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{med.roomNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{med.medication}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{med.dosage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{med.scheduledTime}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {med.administered ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Administered
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!med.administered && (
                                <button
                                  onClick={() => handleAdministerMedication(med._id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Administer
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
            </div>
          )}

          {/* Chat with NurseBot */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Chat with NurseBot 🤖</h2>
                <p className="text-sm text-gray-500">AI assistant for patient care and nursing protocols</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p>Ask NurseBot about medication schedules, patient care procedures, or nursing protocols!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <p className="text-gray-500">NurseBot is thinking...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about medications, procedures, patient care..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
