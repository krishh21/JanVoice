import React, { useCallback, useEffect, useState } from 'react';
import { FaFilter, FaSearch, FaPlus, FaSync } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import ComplaintList from '../components/ComplaintList';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    manage: 'Complaint Management',
    yourComplaints: 'Your registered complaints',
    allComplaints: 'All complaints',
    new: 'New Complaint',
    filter: 'Filter',
    clearFilters: 'Clear all',
    search: 'Search',
    searchPlaceholder: 'Search complaints...',
    status: 'Status',
    allStatus: 'All status',
    category: 'Category',
    allCategory: 'All categories',
    sort: 'Sort by',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortPriority: 'Priority',
    sortUpvotes: 'Most popular',
    priority: 'Priority',
    allPriority: 'All priorities',
    showing: 'Showing {count} complaints',
    for: 'for',
    refresh: 'Refresh',
    noResults: 'No complaints found',
    changeFilters: 'Please change your filters',
    noComplaintsCitizen: 'You have not registered any complaints yet',
    noComplaintsAdmin: 'No complaints have been registered yet',
    firstComplaint: 'Register your first complaint',
    categories: {
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
    },
    statuses: {
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    },
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    }
  },
  hi: {
    manage: 'शिकायत प्रबंधन',
    yourComplaints: 'आपकी दर्ज शिकायतें',
    allComplaints: 'सभी शिकायतें',
    new: 'नई शिकायत',
    filter: 'फ़िल्टर',
    clearFilters: 'सभी साफ़ करें',
    search: 'खोजें',
    searchPlaceholder: 'शिकायत खोजें...',
    status: 'स्थिति',
    allStatus: 'सभी स्थिति',
    category: 'श्रेणी',
    allCategory: 'सभी श्रेणी',
    sort: 'क्रमबद्ध करें',
    sortNewest: 'नवीनतम पहले',
    sortOldest: 'पुराने पहले',
    sortPriority: 'प्राथमिकता',
    sortUpvotes: 'सबसे लोकप्रिय',
    priority: 'प्राथमिकता',
    allPriority: 'सभी प्राथमिकता',
    showing: 'दिखा रहा है {count} शिकायतें',
    for: 'के लिए',
    refresh: 'रिफ्रेश करें',
    noResults: 'कोई शिकायत नहीं मिली',
    changeFilters: 'कृपया अपने फ़िल्टर बदलें',
    noComplaintsCitizen: 'आपने अभी तक कोई शिकायत दर्ज नहीं की है',
    noComplaintsAdmin: 'अभी तक कोई शिकायत दर्ज नहीं की गई है',
    firstComplaint: 'पहली शिकायत दर्ज करें',
    categories: {
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
    },
    statuses: {
      pending: 'लंबित',
      inProgress: 'प्रगति में',
      resolved: 'हल की गई',
      rejected: 'अस्वीकृत'
    },
    priorities: {
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      critical: 'गंभीर'
    }
  }
};

const Complaints = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    priority: searchParams.get('priority') || '',
    sort: searchParams.get('sort') || 'newest'
  });
  const { status, category, priority, sort } = filters;

  const categories = Object.keys(translations[language].categories).map(key => ({
    key,
    label: t(`categories.${key}`)
  }));

  const statuses = ['pending', 'inProgress', 'resolved', 'rejected'].map(s => ({
    value: s === 'inProgress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1),
    label: t(`statuses.${s}`)
  }));

  const priorities = ['low', 'medium', 'high', 'critical'].map(p => ({
    value: p.charAt(0).toUpperCase() + p.slice(1),
    label: t(`priorities.${p}`)
  }));

  const sortOptions = [
    { value: 'newest', label: t('sortNewest') },
    { value: 'oldest', label: t('sortOldest') },
    { value: 'priority', label: t('sortPriority') },
    { value: 'upvotes', label: t('sortUpvotes') }
  ];

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      const response = await api.get(`/complaints?${params.toString()}`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.sort, filters.status, filters.category, filters.priority]);

  const applyFilters = useCallback(() => {
    let filtered = [...complaints];
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint.category.toLowerCase().includes(searchTerm)
      );
    }
    setFilteredComplaints(filtered);
  }, [complaints, filters.search]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    if (priority) params.priority = priority;
    if (sort && sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [status, category, priority, sort, setSearchParams]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', category: '', priority: '', sort: 'newest' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">{t('manage')}</h1>
          <p className="mt-1 text-slate-600">{user?.role === 'citizen' ? t('yourComplaints') : t('allComplaints')}</p>
        </div>
        {user?.role === 'citizen' && (
          <Link to="/new-complaint" className="btn-primary">
            <FaPlus /><span>{t('new')}</span>
          </Link>
        )}
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2"><FaFilter className="text-blue-700" /><h2 className="font-semibold text-slate-950">{t('filter')}</h2></div>
          <button onClick={clearFilters} className="text-sm font-semibold text-blue-700 hover:text-blue-800">{t('clearFilters')}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('search')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="h-5 w-5 text-gray-400" /></div>
              <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="input-field pl-10" placeholder={t('searchPlaceholder')} />
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="input-field">
              <option value="">{t('allStatus')}</option>
              {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input-field">
              <option value="">{t('allCategory')}</option>
              {categories.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
            </select>
          </div>
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('sort')}</label>
            <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="input-field">
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'department') && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('priority')}</label>
              <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input-field">
                <option value="">{t('allPriority')}</option>
                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{t('showing', { count: filteredComplaints.length })}{filters.search && ` "${filters.search}" ${t('for')}`}</p>
        <button onClick={fetchComplaints} className="btn-secondary px-3 py-2"><FaSync /><span>{t('refresh')}</span></button>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length > 0 ? (
        <ComplaintList complaints={filteredComplaints} />
      ) : (
        <div className="panel p-12 text-center">
          <FaSearch className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('noResults')}</h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.status || filters.category ? t('changeFilters') : (user?.role === 'citizen' ? t('noComplaintsCitizen') : t('noComplaintsAdmin'))}
          </p>
          {user?.role === 'citizen' && (
            <Link to="/new-complaint" className="btn-primary">{t('firstComplaint')}</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Complaints;
