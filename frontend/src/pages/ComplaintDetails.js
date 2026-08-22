import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaPaperPlane,
  FaImage,
  FaArrowLeft
} from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    notFound: 'Complaint Not Found',
    backToList: 'Back to Complaints',
    id: 'ID:',
    tabDetails: 'Details',
    tabComments: 'Comments ({count})',
    tabActions: 'Actions',
    description: 'Description',
    images: 'Attached Images',
    info: 'Complaint Information',
    category: 'Category',
    reportedBy: 'Reported By',
    reportedOn: 'Reported On',
    lastUpdated: 'Last Updated',
    location: 'Location',
    coordinates: 'Coordinates: {lat}, {lng}',
    assignedDept: 'Assigned Department',
    assignedTo: 'Assigned to',
    resolution: 'Resolution Details',
    resolvedBy: 'Resolved By',
    resolvedOn: 'Resolved On',
    resolutionNotes: 'Resolution Notes',
    comments: {
      add: 'Add a Comment',
      placeholder: 'Type your comment here...',
      post: 'Post Comment',
      noComments: 'No comments yet. Be the first to comment!',
      official: 'Official'
    },
    actions: {
      updateStatus: 'Update Complaint Status',
      status: 'Update Status',
      resolutionNotes: 'Resolution Notes (for Resolved status)',
      resolutionPlaceholder: 'Describe how the issue was resolved...',
      update: 'Update Status'
    },
    imageModal: {
      clickToView: 'Click to view',
      previous: 'Previous',
      next: 'Next',
      title: 'Image {current} of {total}'
    },
    error: {
      loadFailed: 'Failed to load complaint details',
      statusUpdateFailed: 'Failed to update status',
      commentFailed: 'Failed to add comment',
      voteFailed: 'Failed to process vote'
    },
    success: {
      statusUpdated: 'Status updated successfully',
      commentAdded: 'Comment added successfully',
      upvote: 'Upvote added',
      downvote: 'Downvote removed'
    },
    status: {
      pending: 'Pending',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    }
  },
  hi: {
    notFound: 'शिकायत नहीं मिली',
    backToList: 'शिकायतों पर वापस जाएं',
    id: 'आईडी:',
    tabDetails: 'विवरण',
    tabComments: 'टिप्पणियाँ ({count})',
    tabActions: 'कार्रवाई',
    description: 'विवरण',
    images: 'संलग्न छवियाँ',
    info: 'शिकायत जानकारी',
    category: 'श्रेणी',
    reportedBy: 'रिपोर्टकर्ता',
    reportedOn: 'रिपोर्ट तिथि',
    lastUpdated: 'अंतिम अपडेट',
    location: 'स्थान',
    coordinates: 'निर्देशांक: {lat}, {lng}',
    assignedDept: 'निर्धारित विभाग',
    assignedTo: 'निर्धारित कर्मी',
    resolution: 'समाधान विवरण',
    resolvedBy: 'समाधानकर्ता',
    resolvedOn: 'समाधान तिथि',
    resolutionNotes: 'समाधान नोट्स',
    comments: {
      add: 'टिप्पणी जोड़ें',
      placeholder: 'अपनी टिप्पणी यहां लिखें...',
      post: 'टिप्पणी पोस्ट करें',
      noComments: 'अभी तक कोई टिप्पणी नहीं। पहली टिप्पणी करें!',
      official: 'आधिकारिक'
    },
    actions: {
      updateStatus: 'शिकायत स्थिति अपडेट करें',
      status: 'स्थिति अपडेट करें',
      resolutionNotes: 'समाधान नोट्स (हल की गई स्थिति के लिए)',
      resolutionPlaceholder: 'बताएं कि समस्या का समाधान कैसे किया गया...',
      update: 'स्थिति अपडेट करें'
    },
    imageModal: {
      clickToView: 'देखने के लिए क्लिक करें',
      previous: 'पिछला',
      next: 'अगला',
      title: 'छवि {current} का {total}'
    },
    error: {
      loadFailed: 'शिकायत विवरण लोड करने में विफल',
      statusUpdateFailed: 'स्थिति अपडेट करने में विफल',
      commentFailed: 'टिप्पणी जोड़ने में विफल',
      voteFailed: 'वोट प्रक्रिया विफल'
    },
    success: {
      statusUpdated: 'स्थिति सफलतापूर्वक अपडेट हुई',
      commentAdded: 'टिप्पणी सफलतापूर्वक जोड़ी गई',
      upvote: 'अपवोट जोड़ा गया',
      downvote: 'डाउनवोट हटाया गया'
    },
    status: {
      pending: 'लंबित',
      inProgress: 'प्रगति में',
      resolved: 'हल की गई',
      rejected: 'अस्वीकृत'
    },
    priority: {
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      critical: 'गंभीर'
    }
  }
};

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
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

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [imageModal, setImageModal] = useState({ open: false, index: 0 });

  const fetchComplaintDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      toast.error(translations[language].error.loadFailed);
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, language]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/complaints/${id}/status`, {
        status,
        resolutionNotes: status === 'Resolved' ? resolutionNotes : undefined
      });
      toast.success(t('success.statusUpdated'));
      fetchComplaintDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('error.statusUpdateFailed'));
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/complaints/${id}/comments`, { text: comment });
      setComment('');
      toast.success(t('success.commentAdded'));
      fetchComplaintDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(t('error.commentFailed'));
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'Pending': 'status-pending',
      'In Progress': 'status-in-progress',
      'Resolved': 'status-resolved',
      'Rejected': 'status-rejected'
    };
    const icons = {
      'Pending': <FaClock className="mr-1" />,
      'In Progress': <FaExclamationTriangle className="mr-1" />,
      'Resolved': <FaCheckCircle className="mr-1" />,
      'Rejected': <FaTimes className="mr-1" />
    };
    return (
      <span className={`status-badge ${classes[status]}`}>
        {icons[status]}
        {t(`status.${status.toLowerCase().replace(' ', '')}`)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Critical': 'priority-critical'
    };
    return (
      <span className={`priority-badge ${classes[priority]}`}>
        {t(`priority.${priority.toLowerCase()}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('notFound')}</h2>
        <button onClick={() => navigate('/complaints')} className="btn-primary">{t('backToList')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/complaints')} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{complaint.title}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-gray-600">{t('id')} {complaint._id.substring(0, 8)}</span>
              {getStatusBadge(complaint.status)}
              {getPriorityBadge(complaint.priority)}
            </div>
          </div>
        </div>
      
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button className={`pb-2 ${activeTab === 'details' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`} onClick={() => setActiveTab('details')}>
            {t('tabDetails')}
          </button>
          <button className={`pb-2 ${activeTab === 'comments' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`} onClick={() => setActiveTab('comments')}>
            {t('tabComments', { count: complaint.comments.length })}
          </button>
          {(user?.role === 'admin' || user?.role === 'department') && (
            <button className={`pb-2 ${activeTab === 'actions' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`} onClick={() => setActiveTab('actions')}>
              {t('tabActions')}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{t('description')}</h3>
              <p className="text-gray-700 whitespace-pre-line">{complaint.description}</p>
            </div>
            {complaint.images && complaint.images.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <FaImage /><span>{t('images')}</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => setImageModal({ open: true, index })}>
                      <img src={image.url} alt={`Complaint ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white">{t('imageModal.clickToView')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">{t('info')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">{t('category')}</label>
                  <p className="font-medium">{complaint.category}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">{t('reportedBy')}</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><FaUser className="w-4 h-4 text-primary-600" /></div>
                    <div>
                      <p className="font-medium">{complaint.citizen?.name}</p>
                      <p className="text-sm text-gray-600">{complaint.citizen?.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center space-x-1"><FaCalendarAlt /><span>{t('reportedOn')}</span></label>
                  <p className="font-medium">{format(new Date(complaint.createdAt), 'PPpp')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center space-x-1"><FaCalendarAlt /><span>{t('lastUpdated')}</span></label>
                  <p className="font-medium">{format(new Date(complaint.updatedAt), 'PPpp')}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2"><FaMapMarkerAlt /><span>{t('location')}</span></h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-medium">{complaint.location.address}</p>
                {complaint.location.coordinates?.lat && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('coordinates', { lat: complaint.location.coordinates.lat.toFixed(6), lng: complaint.location.coordinates.lng.toFixed(6) })}
                  </p>
                )}
              </div>
            </div>
            {complaint.department && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2"><FaBuilding /><span>{t('assignedDept')}</span></h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">{complaint.department.name}</p>
                  {complaint.assignedTo && <p className="text-sm text-gray-600 mt-1">{t('assignedTo')}: {complaint.assignedTo.name}</p>}
                </div>
              </div>
            )}
            {complaint.status === 'Resolved' && complaint.resolutionDetails && (
              <div className="card bg-green-50">
                <h3 className="text-lg font-semibold mb-4 text-green-800">{t('resolution')}</h3>
                <div className="space-y-3">
                  <div><label className="text-sm text-green-700">{t('resolvedBy')}</label><p className="font-medium">{complaint.resolutionDetails.resolvedBy?.name}</p></div>
                  <div><label className="text-sm text-green-700">{t('resolvedOn')}</label><p className="font-medium">{format(new Date(complaint.resolutionDetails.resolvedAt), 'PPpp')}</p></div>
                  {complaint.resolutionDetails.resolutionNotes && (
                    <div><label className="text-sm text-green-700">{t('resolutionNotes')}</label><p className="mt-1">{complaint.resolutionDetails.resolutionNotes}</p></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('comments.add')}</h3>
              <div className="space-y-4">
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field h-32" placeholder={t('comments.placeholder')} maxLength={500} />
                <div className="flex justify-end">
                  <button onClick={handleAddComment} className="btn-primary flex items-center space-x-2" disabled={!comment.trim()}>
                    <FaPaperPlane /><span>{t('comments.post')}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {complaint.comments.length === 0 ? (
                <div className="card text-center py-8"><p className="text-gray-500">{t('comments.noComments')}</p></div>
              ) : (
                complaint.comments.map((comment, index) => (
                  <div key={index} className={`card ${comment.isOfficial ? 'border-l-4 border-blue-500' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comment.isOfficial ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <FaUser className={comment.isOfficial ? 'text-blue-600' : 'text-gray-600'} />
                        </div>
                        <div>
                          <p className="font-medium">{comment.user?.name}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">{format(new Date(comment.createdAt), 'PPpp')}</p>
                            {comment.isOfficial && <span className="badge bg-blue-100 text-blue-800 text-xs">{t('comments.official')}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (user?.role === 'admin' || user?.role === 'department') && (
        <div className="card max-w-2xl">
          <h3 className="text-lg font-semibold mb-6">{t('actions.updateStatus')}</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.status')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((statusOption) => (
                  <button key={statusOption} className={`p-3 rounded-lg border-2 ${status === statusOption ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`} onClick={() => setStatus(statusOption)}>
                    {getStatusBadge(statusOption)}
                  </button>
                ))}
              </div>
            </div>
            {status === 'Resolved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('actions.resolutionNotes')}</label>
                <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} className="input-field h-32" placeholder={t('actions.resolutionPlaceholder')} maxLength={1000} />
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={handleStatusUpdate} className="btn-primary" disabled={status === complaint.status && (status !== 'Resolved' || !resolutionNotes.trim())}>
                {t('actions.update')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal.open && complaint.images[imageModal.index] && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">{t('imageModal.title', { current: imageModal.index + 1, total: complaint.images.length })}</h3>
              <button onClick={() => setImageModal({ open: false, index: 0 })} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-4">
              <img src={complaint.images[imageModal.index].url} alt={`Complaint ${imageModal.index + 1}`} className="max-h-[70vh] mx-auto" />
            </div>
            <div className="flex justify-between items-center p-4 border-t">
              <button onClick={() => setImageModal(prev => ({ ...prev, index: prev.index > 0 ? prev.index - 1 : complaint.images.length - 1 }))} className="btn-secondary">{t('imageModal.previous')}</button>
              <div className="flex space-x-2">
                {complaint.images.map((_, index) => (
                  <button key={index} onClick={() => setImageModal({ open: true, index })} className={`w-3 h-3 rounded-full ${imageModal.index === index ? 'bg-primary-600' : 'bg-gray-300'}`} />
                ))}
              </div>
              <button onClick={() => setImageModal(prev => ({ ...prev, index: prev.index < complaint.images.length - 1 ? prev.index + 1 : 0 }))} className="btn-secondary">{t('imageModal.next')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
