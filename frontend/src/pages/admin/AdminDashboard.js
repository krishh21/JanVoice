import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBuilding, 
  FaClipboardList, 
  FaCheckCircle,
  FaArrowRight,
  FaUserTie,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { useLanguage } from '../../context/LanguageContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const translations = {

  en: {

    title: 'Admin Dashboard',

    subtitle: 'System-wide analytics and management',

    stats: {

      totalUsers: 'Total Users',

      departments: 'Departments',

      totalComplaints: 'Total Complaints',

      recentlyResolved: 'Recently Resolved'

    },

    charts: {

      monthlyTrend: 'Monthly Complaint Trend',

      byStatus: 'Complaints by Status',

      complaints: 'Complaints',

      resolved: 'Resolved',

      trendsLabel: 'Number of Complaints'

    },

    topDepartments: 'Top Performing Departments',

    resolutionRate: 'Resolution Rate',

    resolved: 'Resolved',

    recentActivity: 'Recent Activity',

    noDeptData: 'No department performance data available yet.',

    viewAll: 'View All',

    role: {

      citizen: 'Citizen',

      department: 'Department',

      admin: 'Admin'

    },

    status: {

      pending: 'Pending',

      inProgress: 'In Progress',

      resolved: 'Resolved',

      rejected: 'Rejected'

    },

    category: {

      road: 'Road & Infrastructure',

      water: 'Water Supply',

      electricity: 'Electricity',

      sanitation: 'Sanitation & Waste',

      safety: 'Public Safety',

      healthcare: 'Healthcare',

      education: 'Education',

      park: 'Parks & Recreation',

      traffic: 'Traffic & Transportation',

      other: 'Others'

    }

  },

  hi: {

    title: 'प्रशासन डैशबोर्ड',

    subtitle: 'सिस्टम-व्यापी विश्लेषण और प्रबंधन',

    stats: {

      totalUsers: 'कुल उपयोगकर्ता',

      departments: 'विभाग',

      totalComplaints: 'कुल शिकायतें',

      recentlyResolved: 'हाल ही में हल की गई'

    },

    charts: {

      monthlyTrend: 'मासिक शिकायत प्रवृत्ति',

      byStatus: 'स्थिति के अनुसार शिकायतें',

      complaints: 'शिकायतें',

      resolved: 'हल की गई',

      trendsLabel: 'शिकायतों की संख्या'

    },

    topDepartments: 'शीर्ष प्रदर्शन करने वाले विभाग',

    resolutionRate: 'समाधान दर',

    resolved: 'हल की गई',

    recentActivity: 'हाल की गतिविधि',

    noDeptData: 'अभी तक कोई विभाग प्रदर्शन डेटा उपलब्ध नहीं है।',

    viewAll: 'सभी देखें',

    role: {

      citizen: 'नागरिक',

      department: 'विभाग',

      admin: 'प्रशासक'

    },

    status: {

      pending: 'लंबित',

      inProgress: 'प्रगति में',

      resolved: 'हल की गई',

      rejected: 'अस्वीकृत'

    },

    category: {

      road: 'सड़क एवं बुनियादी ढांचा',

      water: 'जल आपूर्ति',

      electricity: 'बिजली',

      sanitation: 'स्वच्छता एवं कचरा',

      safety: 'सार्वजनिक सुरक्षा',

      healthcare: 'स्वास्थ्य सेवा',

      education: 'शिक्षा',

      park: 'पार्क एवं मनोरंजन',

      traffic: 'यातायात एवं परिवहन',

      other: 'अन्य'

    }

  }

};



const AdminDashboard = () => {
  const { language } = useLanguage();
  
  // Translation Helper
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) {
      if (val && val[k] !== undefined) val = val[k];
      else return key;
    }
    if (typeof val === 'string') {
      Object.keys(params).forEach(p => { val = val.replace(`{${p}}`, params[p]); });
    }
    return val;
  };

  const [analytics, setAnalytics] = useState({
    usersByRole: [],
    totalDepartments: 0,
    totalComplaints: 0,
    recentResolved: 0,
    topDepartments: [],
    monthlyTrend: []
  });
  
  const [dashboardStats, setDashboardStats] = useState({
    totals: { users: 0, pending: 0, resolvedToday: 0 },
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, statsRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/dashboard-stats')
        ]);
        setAnalytics(analyticsRes.data);
        setDashboardStats(statsRes.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalUsers = analytics.usersByRole?.reduce((sum, role) => sum + (role.count || 0), 0) || dashboardStats.totals.users;

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* 1. FIXED HEADER: Gradient Background (Matches your screenshot) */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaUserTie className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium uppercase tracking-wider">
                  ADMIN ROLE
                </span>
                <h1 className="text-3xl font-bold mt-2">{t('title')}</h1>
              </div>
            </div>
            <p className="text-white text-opacity-90 max-w-xl">{t('subtitle')}</p>
            
            <div className="mt-6 flex flex-wrap gap-6 items-center">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-white text-opacity-70" />
                <span className="font-medium text-lg">स्वागत है, Administrator!</span>
              </div>
              <span className="text-sm bg-black bg-opacity-20 px-4 py-1.5 rounded-md border border-white border-opacity-10">
                System Active • 2026
              </span>
            </div>
          </div>

          {/* Right Side Account Badge */}
          <div className="hidden lg:block">
            <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20 backdrop-blur-sm">
              <p className="text-xs opacity-70 uppercase font-semibold">खाता प्रकार</p>
              <p className="text-3xl font-bold uppercase tracking-tight">ADMIN</p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm opacity-90 font-mono italic">स्थिति: सक्रिय</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS: High impact grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem title={t('stats.totalUsers')} value={totalUsers} icon={<FaUsers />} color="blue" />
        <StatItem title={t('stats.departments')} value={analytics.totalDepartments} icon={<FaBuilding />} color="green" />
        <StatItem title={t('stats.totalComplaints')} value={analytics.totalComplaints} icon={<FaClipboardList />} color="purple" />
        <StatItem title={t('stats.recentlyResolved')} value={analytics.recentResolved} icon={<FaCheckCircle />} color="orange" />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('charts.monthlyTrend')}</h3>
          <div className="h-72">
            <Line 
              data={{
                labels: analytics.monthlyTrend?.map(item => item.month) || [],
                datasets: [{
                  label: t('charts.complaints'),
                  data: analytics.monthlyTrend?.map(item => item.complaints) || [],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('charts.byStatus')}</h3>
          <div className="h-72">
            <Pie 
              data={{
                labels: [t('status.pending'), t('status.inProgress'), t('status.resolved')],
                datasets: [{
                  data: [dashboardStats.totals.pending, 5, analytics.recentResolved],
                  backgroundColor: ['#FBBF24', '#3B82F6', '#10B981']
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* 4. TOP DEPARTMENTS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">{t('topDepartments')}</h3>
          <Link to="/admin/departments" className="text-blue-600 hover:underline flex items-center text-sm font-semibold">
            {t('viewAll')} <FaArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.topDepartments?.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center font-bold text-blue-600 border border-gray-100">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{dept.name}</h4>
                  <p className="text-xs text-gray-500 uppercase">{t('resolutionRate')}: {dept.resolutionRate || 0}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{dept.resolvedComplaints || 0}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t('resolved')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-component for Clean Stats
const StatItem = ({ title, value, icon, color }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-b-4 ${themes[color]} hover:translate-y-[-5px] transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${themes[color].split(' ')[0]}`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
