import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import Sidebar from '../components/Sidebar';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newPatient, setNewPatient] = useState({
    patientName: '',
    patientAge: '',
    roomNumber: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  const [editPatient, setEditPatient] = useState({
    _id: '',
    patientAge: '',
    roomNumber: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    status: 'active'
  });

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

      // Fetch patients (PatientRecords in doctor's department)
      const patientsRes = await axios.get('http://localhost:5000/api/doctor/patients', config);
      setPatients(patientsRes.data.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    setShowAddModal(true);
    setNewPatient({
      patientName: '',
      patientAge: '',
      roomNumber: '',
      diagnosis: '',
      prescription: '',
      notes: ''
    });
  };

  const handleSubmitNewPatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('http://localhost:5000/api/doctor/add-record', newPatient, config);
      
      setSuccess('Patient record added successfully!');
      setShowAddModal(false);
      setNewPatient({
        patientName: '',
        patientAge: '',
        roomNumber: '',
        diagnosis: '',
        prescription: '',
        notes: ''
      });
      
      // Refresh patients list
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding patient:', error);
      setError(error.response?.data?.message || 'Failed to add patient record');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setEditPatient({
      _id: patient._id,
      patientAge: patient.age,
      roomNumber: patient.roomNumber,
      diagnosis: patient.diagnosisHistory,
      prescription: patient.prescription,
      notes: patient.notes || '',
      status: patient.status
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `http://localhost:5000/api/doctor/update-record/${editPatient._id}`,
        editPatient,
        config
      );
      
      setSuccess('Patient record updated successfully!');
      setShowEditModal(false);
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating patient:', error);
      setError(error.response?.data?.message || 'Failed to update patient record');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (patientId, patientName) => {
    if (!window.confirm(`Are you sure you want to delete the record for ${patientName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `http://localhost:5000/api/doctor/delete-record/${patientId}`,
        config
      );
      
      setSuccess('Patient record deleted successfully!');
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError(error.response?.data?.message || 'Failed to delete patient record');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadPDF = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch the specific patient record
      const response = await axios.get(
        `http://localhost:5000/api/doctor/record/${patientId}`,
        config
      );

      const patient = response.data.data;

      // Create PDF
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Patient Record - ${patient.patientName}`,
        subject: 'Medical Record',
        author: user?.name || 'Doctor',
        keywords: 'patient, medical, record',
        creator: 'HealthSecure System'
      });

      // Add header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT MEDICAL RECORD', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('HealthSecure Hospital System', 105, 30, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Patient Information Section
      let y = 55;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Patient details
      const leftCol = 20;
      const rightCol = 110;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Name:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.patientName, leftCol + 40, y);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Age:', rightCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${patient.patientAge} years`, rightCol + 15, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Room Number:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.roomNumber, leftCol + 40, y);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Status:', rightCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.status.toUpperCase(), rightCol + 15, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Department:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.department || 'N/A', leftCol + 40, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Assigned Doctor:', leftCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.assignedDoctorName || 'N/A', leftCol + 40, y);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', rightCol, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(patient.createdAt).toLocaleDateString(), rightCol + 15, y);
      y += 15;

      // Diagnosis Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis', 20, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(patient.diagnosis, 170);
      doc.text(diagnosisLines, 20, y);
      y += diagnosisLines.length * 6 + 10;

      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Prescription Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescription', 20, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const prescriptionLines = doc.splitTextToSize(patient.prescription, 170);
      doc.text(prescriptionLines, 20, y);
      y += prescriptionLines.length * 6 + 10;

      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Notes Section (if exists)
      if (patient.notes && patient.notes.trim() !== '') {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Notes', 20, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(patient.notes, 170);
        doc.text(notesLines, 20, y);
        y += notesLines.length * 6 + 10;
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
          105,
          290,
          { align: 'center' }
        );
        doc.text('Confidential Medical Record', 105, 285, { align: 'center' });
      }

      // Save the PDF
      const fileName = `Patient_${patient.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      setSuccess(`PDF downloaded: ${fileName}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(error.response?.data?.message || 'Failed to download PDF');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="doctor" userName={user?.name || 'Doctor'} />
      
      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.specialization && (
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {user.specialization} Department
              </span>
            )}
          </p>
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

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={handleAddPatient}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Patient Record</span>
          </button>
        </div>

        {/* My Patients Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-700">👥 My Department Patients</h2>
          {patients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No patients in your department yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.roomNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {patient.diagnosisHistory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          patient.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEditClick(patient)}
                          className="text-blue-600 hover:text-blue-900 font-medium"title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient._id, patient.patientName)}
                          className="text-red-600 hover:text-red-900 font-medium"
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(patient._id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                          title="Download PDF"
                        >
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Add Patient Record</h3>
            <form onSubmit={handleSubmitNewPatient}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={newPatient.patientName}
                    onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter patient name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={newPatient.patientAge}
                      onChange={(e) => setNewPatient({ ...newPatient, patientAge: e.target.value })}
                      required
                      min="0"
                      max="150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={newPatient.roomNumber}
                      onChange={(e) => setNewPatient({ ...newPatient, roomNumber: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Room #"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    value={newPatient.diagnosis}
                    onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter diagnosis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription *
                  </label>
                  <textarea
                    value={newPatient.prescription}
                    onChange={(e) => setNewPatient({ ...newPatient, prescription: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter prescription details"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Edit Patient: {selectedPatient.patientName}</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={editPatient.patientAge}
                      onChange={(e) => setEditPatient({ ...editPatient, patientAge: e.target.value })}
                      required
                      min="0"
                      max="150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={editPatient.roomNumber}
                      onChange={(e) => setEditPatient({ ...editPatient, roomNumber: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    value={editPatient.diagnosis}
                    onChange={(e) => setEditPatient({ ...editPatient, diagnosis: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription *
                  </label>
                  <textarea
                    value={editPatient.prescription}
                    onChange={(e) => setEditPatient({ ...editPatient, prescription: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editPatient.notes}
                    onChange={(e) => setEditPatient({ ...editPatient, notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={editPatient.status}
                    onChange={(e) => setEditPatient({ ...editPatient, status: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
