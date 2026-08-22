import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    noComplaints: 'No complaints found',
    viewDetails: 'View',
    category: 'Category',
    dept: 'Dept',
    priority: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
  },
  hi: {
    noComplaints: 'कोई शिकायत नहीं मिली',
    viewDetails: 'देखें',
    category: 'श्रेणी',
    dept: 'विभाग',
    priority: { low: 'कम', medium: 'मध्यम', high: 'उच्च', critical: 'गंभीर' }
  }
};

const statusClasses = {
  Pending: 'status-pending',
  'In Progress': 'status-in-progress',
  Resolved: 'status-resolved',
  Rejected: 'status-rejected'
};

const priorityClasses = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
  Critical: 'priority-critical'
};

const ComplaintList = ({ complaints = [], compact = false }) => {
  const { language } = useLanguage();
  const t = (key) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) {
      if (val && val[k] !== undefined) val = val[k];
      else return key;
    }
    return val;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock className="text-amber-600" />;
      case 'In Progress':
        return <FaExclamationTriangle className="text-blue-600" />;
      case 'Resolved':
        return <FaCheckCircle className="text-emerald-600" />;
      default:
        return <FaClock className="text-slate-500" />;
    }
  };

  if (!complaints.length) {
    return <p className="py-8 text-center text-slate-500">{t('noComplaints')}</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {complaints.map((complaint) => {
        const createdAt = complaint.createdAt ? format(new Date(complaint.createdAt), 'MMM dd, yyyy') : '';
        const priority = complaint.priority || 'Medium';

        return (
          <Link
            key={complaint._id}
            to={`/complaints/${complaint._id}`}
            className="block py-4 transition hover:bg-slate-50 sm:px-3"
          >
            <div className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                {getStatusIcon(complaint.status)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950">{complaint.title}</h3>
                    {!compact && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{complaint.description}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span className={`status-badge ${statusClasses[complaint.status] || 'bg-slate-100 text-slate-700'}`}>{complaint.status}</span>
                    <span className={`badge ${priorityClasses[priority] || priorityClasses.Medium}`}>{t(`priority.${priority.toLowerCase()}`)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('category')}: {complaint.category}</span>
                    {createdAt && <span>{createdAt}</span>}
                    {complaint.department?.name && <span>{t('dept')}: {complaint.department.name}</span>}
                  </div>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                    {t('viewDetails')}
                    <FaArrowRight className="text-[10px]" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ComplaintList;
