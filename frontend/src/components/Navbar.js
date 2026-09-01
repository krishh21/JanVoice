import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBell, FaBars, FaTimes, FaHome, FaClipboardList, FaPlusCircle, FaChartBar, FaBuilding, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Smart City Portal',
    dashboard: 'Dashboard',
    complaints: 'Complaints',
    community: 'Community',
    newComplaint: 'New Complaint',
    adminDashboard: 'Admin Dashboard',
    departments: 'Departments',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile'
  },
  hi: {
    title: 'स्मार्ट सिटी पोर्टल',
    dashboard: 'डैशबोर्ड',
    complaints: 'शिकायतें',
    community: 'समुदाय',
    newComplaint: 'नई शिकायत',
    adminDashboard: 'प्रशासन डैशबोर्ड',
    departments: 'विभाग',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    profile: 'प्रोफाइल'
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = (key) => translations[language][key] || key;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <FaHome />, labelKey: 'dashboard', roles: ['citizen', 'admin', 'department'] },
    { to: '/complaints', icon: <FaClipboardList />, labelKey: 'complaints', roles: ['citizen', 'admin', 'department'] },
    { to: '/community', icon: <FaUsers />, labelKey: 'community', roles: ['citizen', 'admin', 'department'] },
    { to: '/new-complaint', icon: <FaPlusCircle />, labelKey: 'newComplaint', roles: ['citizen'] },
    { to: '/admin', icon: <FaChartBar />, labelKey: 'adminDashboard', roles: ['admin'] },
    { to: '/admin/departments', icon: <FaBuilding />, labelKey: 'departments', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const isActiveRoute = (to) => {
    if (to === '/admin') {
      return location.pathname === to;
    }

    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-800">{t('title')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user && filteredNavItems.map((item) => {
              const isActive = isActiveRoute(item.to);

              return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
              </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleLanguage} className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200">
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {user ? (
              <>
                <button className="relative p-2 text-gray-600 hover:text-primary-600">
                  <FaBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="hidden md:inline text-gray-700">{user.name}</span>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                        <FaUser className="w-4 h-4" />
                        <span>{t('profile')}</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary">{t('login')}</Link>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && user && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = isActiveRoute(item.to);

                return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
