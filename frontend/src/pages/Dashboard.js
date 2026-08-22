import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaPlus,
  FaUsers
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/axios';
import ComplaintList from '../components/ComplaintList';

const translations = {
  en: {
    hello: 'Hello, {name}',
    subtitle: 'Here is what needs attention today.',
    citizenSubtitle: 'Track your complaints and report new civic issues.',
    adminSubtitle: 'Monitor complaints, users, and departments.',
    total: 'Total',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    quickActions: 'Quick actions',
    recentComplaints: 'Recent complaints',
    viewAll: 'View all',
    newComplaint: 'New complaint',
    myComplaints: 'My complaints',
    community: 'Community',
    admin: 'Admin panel',
    departments: 'Departments',
    users: 'Users',
    empty: 'No recent complaints yet.'
  },
  hi: {
    hello: 'नमस्ते, {name}',
    subtitle: 'आज जिन चीजों पर ध्यान चाहिए।',
    citizenSubtitle: 'अपनी शिकायतें ट्रैक करें और नई समस्या दर्ज करें।',
    adminSubtitle: 'शिकायतें, यूजर और विभाग मॉनिटर करें।',
    total: 'कुल',
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल हुई',
    quickActions: 'त्वरित कार्य',
    recentComplaints: 'हाल की शिकायतें',
    viewAll: 'सभी देखें',
    newComplaint: 'नई शिकायत',
    myComplaints: 'मेरी शिकायतें',
    community: 'समुदाय',
    admin: 'प्रशासन पैनल',
    departments: 'विभाग',
    users: 'यूजर',
    empty: 'अभी कोई हाल की शिकायत नहीं है।'
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, recent: [] });
  const [loading, setLoading] = useState(true);

  const t = (key, params = {}) => {
    let value = translations[language]?.[key] || key;
    Object.keys(params).forEach(param => {
      value = value.replace(`{${param}}`, params[param]);
    });
    return value;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints');
      const complaints = Array.isArray(response.data) ? response.data : [];
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        recent: complaints.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const actions = user?.role === 'admin'
    ? [
        { to: '/admin', label: t('admin'), icon: FaClipboardList },
        { to: '/admin/departments', label: t('departments'), icon: FaUsers },
        { to: '/admin/users', label: t('users'), icon: FaUsers }
      ]
    : [
        { to: '/new-complaint', label: t('newComplaint'), icon: FaPlus },
        { to: '/complaints', label: t('myComplaints'), icon: FaClipboardList },
        { to: '/community', label: t('community'), icon: FaUsers }
      ];

  const statCards = [
    { label: t('total'), value: stats.total, icon: FaClipboardList, className: 'text-slate-700 bg-slate-100' },
    { label: t('pending'), value: stats.pending, icon: FaClock, className: 'text-amber-700 bg-amber-50' },
    { label: t('inProgress'), value: stats.inProgress, icon: FaExclamationTriangle, className: 'text-blue-700 bg-blue-50' },
    { label: t('resolved'), value: stats.resolved, icon: FaCheckCircle, className: 'text-emerald-700 bg-emerald-50' }
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-b-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{user?.role || 'citizen'}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{t('hello', { name: user?.name || 'User' })}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              {user?.role === 'admin' ? t('adminSubtitle') : t('citizenSubtitle')}
            </p>
          </div>
          <Link to="/complaints" className="btn-secondary">
            {t('viewAll')}
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, className }) => (
          <div key={label} className="panel p-5">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${className}`}>
              <Icon />
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-bold text-slate-950">{t('quickActions')}</h2>
          <div className="mt-4 space-y-2">
            {actions.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800">
                <span className="flex items-center gap-3">
                  <Icon className="text-blue-700" />
                  {label}
                </span>
                <FaArrowRight className="text-xs" />
              </Link>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">{t('recentComplaints')}</h2>
            <Link to="/complaints" className="text-sm font-semibold text-blue-700 hover:text-blue-800">{t('viewAll')}</Link>
          </div>
          {stats.recent.length ? <ComplaintList complaints={stats.recent} compact /> : <p className="py-8 text-center text-slate-500">{t('empty')}</p>}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
