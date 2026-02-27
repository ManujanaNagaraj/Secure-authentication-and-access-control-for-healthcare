import { useNavigate } from 'react-router-dom';

const Sidebar = ({ role, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    patient: [
      { name: 'Dashboard', icon: '📊', path: '/dashboard/patient' },
      { name: 'Chat with HealthBot', icon: '🤖', path: '/dashboard/patient/chat' },
      { name: 'Medical Records', icon: '📋', active: true },
      { name: 'Appointments', icon: '📅', active: true },
      { name: 'Profile', icon: '👤', active: true },
    ],
    doctor: [
      { name: 'Dashboard', icon: '📊', path: '/dashboard/doctor' },
      { name: 'My Patients', icon: '👥', active: true },
      { name: 'Appointments', icon: '📅', active: true },
      { name: 'Add Record', icon: '➕', active: true },
    ],
    admin: [
      { name: 'Dashboard', icon: '📊', path: '/dashboard/admin' },
      { name: 'Users', icon: '👥', active: true },
      { name: 'Statistics', icon: '📈', active: true },
      { name: 'Security', icon: '🔒', active: true },
    ],
  };

  return (
    <div className="w-64 bg-primary-700 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary-600">
        <h1 className="text-xl font-bold">🏥 HealthSecure</h1>
        <p className="text-sm text-primary-200 mt-1 capitalize">{role} Portal</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-primary-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-primary-200 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems[role]?.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => item.path && navigate(item.path)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-primary-600">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
