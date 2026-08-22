import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaPhone, FaEnvelope, FaChartLine, FaSync } from 'react-icons/fa';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    categories: []
  });

  const categoriesOptions = [
    'Road & Infrastructure', 'Water Supply', 'Electricity', 'Sanitation & Waste',
    'Public Safety', 'Healthcare', 'Education', 'Parks & Recreation',
    'Traffic & Transportation', 'Others'
  ];

  // Using useCallback to prevent unnecessary re-renders
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments');
      
      // Ensure we are setting an array even if backend returns data wrapped in an object
      const data = Array.isArray(response.data) ? response.data : (response.data.departments || []);
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error(error.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch when the page loads
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await api.put(`/admin/departments/${editingDepartment._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/admin/departments', formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments(); // Refresh list after saving
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving department');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/admin/departments/${id}`);
        toast.success('Department deleted');
        fetchDepartments(); // Refresh list after deletion
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setEditingDepartment(null);
    setFormData({ name: '', description: '', email: '', phone: '', address: '', categories: [] });
  };

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      email: dept.email,
      phone: dept.phone,
      address: dept.address,
      categories: dept.categories || []
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading Departments...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Departments Management</h1>
          <p className="text-gray-600">Overview of city administrative units</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={fetchDepartments} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600" title="Refresh">
            <FaSync />
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaPlus /> Add Department
          </button>
        </div>
      </div>

      {/* Grid Container */}
      {departments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <FaBuilding className="text-2xl" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit /></button>
                  <button onClick={() => handleDelete(dept._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1">{dept.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{dept.description}</p>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center text-sm text-gray-600 gap-3">
                  <FaEnvelope className="text-gray-400" /> {dept.email}
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-3">
                  <FaPhone className="text-gray-400" /> {dept.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-3">
                  <FaChartLine className="text-gray-400" /> Resolution: {dept.resolutionRate || 0}%
                </div>
              </div>

              {dept.categories?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {dept.categories.slice(0, 3).map((cat, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {cat}
                    </span>
                  ))}
                  {dept.categories.length > 3 && <span className="text-[10px] text-gray-400">+{dept.categories.length - 3} more</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <FaBuilding className="mx-auto text-5xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Departments Found</h2>
          <p className="text-gray-500 mb-6">Start by adding the first city department to the system.</p>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Create Department
          </button>
        </div>
      )}

      {/* Modal - Kept consistent with your original UI but cleaned up */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingDepartment ? 'Edit Department' : 'New Department'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department Name</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg p-2 h-24" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded-lg p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg p-2" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categoriesOptions.map(cat => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`text-xs p-2 rounded-md border transition-all ${formData.categories.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
