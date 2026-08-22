import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartBar, FaClipboardList, FaHome, FaPlus, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    banner: 'JANVOICE',
    title: 'JanVoice',
    dashboard: 'Dashboard',
    complaints: 'Complaints',
    community: 'Community',
    newComplaint: 'New Complaint',
    admin: 'Admin',
    logout: 'Logout',
    login: 'Login'
  },
  hi: {
    banner: 'JANVOICE',
    title: 'JanVoice',
    dashboard: 'डैशबोर्ड',
    complaints: 'शिकायतें',
    community: 'समुदाय',
    newComplaint: 'नई शिकायत दर्ज करें',
    admin: 'प्रशासन',
    logout: 'लॉगआउट',
    login: 'लॉगिन'
  }
};

const UPGovHeader = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = (key) => translations[language][key] || key;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user ? [
    { to: '/dashboard', label: t('dashboard'), icon: FaHome, show: true },
    { to: '/complaints', label: t('complaints'), icon: FaClipboardList, show: true },
    { to: '/community', label: t('community'), icon: FaChartBar, show: true },
    { to: '/new-complaint', label: t('newComplaint'), icon: FaPlus, show: user.role === 'citizen' },
    { to: '/admin', label: t('admin'), icon: FaChartBar, show: user.role === 'admin' }
  ].filter(item => item.show) : [];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-shell px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/janVoice.webp"
              alt="JanVoice"
              className="h-11 w-16 rounded-lg object-cover object-left"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{t('banner')}</p>
              <h1 className="text-base font-bold leading-tight text-slate-950 sm:text-lg">{t('title')}</h1>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  <Icon className="text-xs" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={toggleLanguage} className="btn-secondary px-3 py-2">
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              {user ? (
                <>
                  <Link to="/profile" className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left sm:flex">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <FaUser className="text-xs" />
                    </span>
                    <span>
                      <span className="block max-w-[140px] truncate text-xs font-semibold text-slate-900">{user.name}</span>
                      <span className="block text-[10px] uppercase tracking-wide text-slate-500">{user.role}</span>
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary px-3 py-2 text-rose-700 hover:bg-rose-50">
                    <FaSignOutAlt className="text-xs" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary">
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UPGovHeader;
