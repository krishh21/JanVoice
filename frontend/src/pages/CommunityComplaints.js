import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaThumbsUp, FaComment, FaMapMarkerAlt, FaClock, FaUser, FaFilter } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const translations = {
  en: {
    title: 'Community Complaints',
    subtitle: 'View and engage with community complaints',
    loading: 'Loading complaints...',
    noComplaints: 'No complaints found',
    like: 'Like',
    unlike: 'Unlike',
    comment: 'Comment',
    comments: 'Comments',
    addComment: 'Add a comment...',
    submit: 'Submit',
    filter: 'Filter',
    sort: 'Sort by',
    newest: 'Newest',
    oldest: 'Oldest',
    popular: 'Most Liked',
    mostCommented: 'Most Commented',
    status: 'Status',
    category: 'Category',
    all: 'All',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    likes: 'likes',
    commentPlaceholder: 'Write your comment here...',
    commentSuccess: 'Comment added successfully',
    likeSuccess: 'Complaint liked',
    unlikeSuccess: 'Complaint unliked'
  },
  hi: {
    title: 'समुदाय की शिकायतें',
    subtitle: 'समुदाय की शिकायतों को देखें और जुड़ें',
    loading: 'शिकायतें लोड हो रही हैं...',
    noComplaints: 'कोई शिकायत नहीं मिली',
    like: 'लाइक',
    unlike: 'अनलाइक',
    comment: 'टिप्पणी',
    comments: 'टिप्पणियाँ',
    addComment: 'टिप्पणी जोड़ें...',
    submit: 'सबमिट करें',
    filter: 'फिल्टर',
    sort: 'क्रमबद्ध करें',
    newest: 'नवीनतम',
    oldest: 'सबसे पुरानी',
    popular: 'सबसे पसंद किए गए',
    mostCommented: 'सबसे ज्यादा टिप्पणी',
    status: 'स्थिति',
    category: 'श्रेणी',
    all: 'सभी',
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गई',
    likes: 'लाइक',
    commentPlaceholder: 'अपनी टिप्पणी यहाँ लिखें...',
    commentSuccess: 'टिप्पणी सफलतापूर्वक जोड़ी गई',
    likeSuccess: 'शिकायत को लाइक किया गया',
    unlikeSuccess: 'शिकायत को अनलाइक किया गया'
  }
};

const CommunityComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sort: 'newest',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', '20');

      const response = await api.get(`/complaints/community/all?${params}`);
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleLike = async (complaintId) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/like`);

      // Update the complaint in the list
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === complaintId
            ? {
                ...complaint,
                likes: response.data.isLiked
                  ? [...complaint.likes, { user: { _id: user._id, name: user.name } }]
                  : complaint.likes.filter(like => like.user._id !== user._id)
              }
            : complaint
        )
      );

      toast.success(response.data.isLiked ? t('likeSuccess') : t('unlikeSuccess'));
    } catch (error) {
      console.error('Error liking complaint:', error);
      toast.error('Failed to like complaint');
    }
  };

  const handleComment = async (complaintId) => {
    const text = commentText[complaintId]?.trim();
    if (!text) return;

    try {
      await api.post(`/complaints/${complaintId}/comments`, { text });

      // Clear the comment input
      setCommentText(prev => ({ ...prev, [complaintId]: '' }));

      // Refresh complaints to show new comment
      fetchComplaints();

      toast.success(t('commentSuccess'));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const toggleComments = (complaintId) => {
    setShowComments(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  const isLiked = (complaint) => {
    return complaint.likes.some(like => like.user._id === user._id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Road & Infrastructure': 'bg-red-100 text-red-800',
      'Water Supply': 'bg-blue-100 text-blue-800',
      'Electricity': 'bg-yellow-100 text-yellow-800',
      'Sanitation & Waste': 'bg-green-100 text-green-800',
      'Public Safety': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-pink-100 text-pink-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Parks & Recreation': 'bg-teal-100 text-teal-800',
      'Traffic & Transportation': 'bg-orange-100 text-orange-800',
      'Others': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Others'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <FaFilter />
            <span>{t('filter')}</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('status')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all')}</option>
                <option value="Pending">{t('pending')}</option>
                <option value="In Progress">{t('inProgress')}</option>
                <option value="Resolved">{t('resolved')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all')}</option>
                <option value="Road & Infrastructure">Road & Infrastructure</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Sanitation & Waste">Sanitation & Waste</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Parks & Recreation">Parks & Recreation</option>
                <option value="Traffic & Transportation">Traffic & Transportation</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sort')}
              </label>
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t('newest')}</option>
                <option value="oldest">{t('oldest')}</option>
                <option value="popular">{t('popular')}</option>
                <option value="most-commented">{t('mostCommented')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('noComplaints')}</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Complaint Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    to={`/complaints/${complaint._id}`}
                    className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2 block"
                  >
                    {complaint.title}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <FaUser className="mr-1" />
                      {complaint.citizen ? complaint.citizen.name : 'Anonymous'}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      {complaint.location ? complaint.location.address : 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                      {complaint.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complaint Description */}
              <p className="text-gray-700 mb-4 line-clamp-3">{complaint.description}</p>

              {/* Images */}
              {complaint.images && complaint.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {complaint.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Complaint ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(complaint._id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      isLiked(complaint)
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FaThumbsUp />
                    <span>{complaint.likes.length} {t('likes')}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(complaint._id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FaComment />
                    <span>{complaint.comments.length} {t('comments')}</span>
                  </button>
                </div>

                <Link
                  to={`/complaints/${complaint._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>

              {/* Comments Section */}
              {showComments[complaint._id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3 mb-4">
                    {complaint.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.user ? comment.user.name : 'Anonymous'}</span>
                          {comment.user && comment.user.role === 'department' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              Official
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={commentText[complaint._id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                      placeholder={t('commentPlaceholder')}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(complaint._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(complaint._id)}
                      disabled={!commentText[complaint._id]?.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {t('submit')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityComplaints;
