import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaLock, FaSave, FaEdit } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'My Profile',
    subtitle: 'Manage your account information',
    edit: 'Edit Profile',
    cancelEdit: 'Cancel Edit',
    success: 'Profile updated successfully!',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    accountType: 'Account Type',
    address: 'Address',
    changePassword: 'Change Password',
    passwordHint: "Leave blank if you don't want to change your password",
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPasswordPlaceholder: 'Confirm new password',
    save: 'Save Changes',
    stats: 'Account Statistics',
    memberSince: 'Member Since',
    status: 'Account Status',
    active: 'Active',
    inactive: 'Inactive',
    userId: 'User ID',
    role: {
      citizen: 'Citizen',
      admin: 'Admin',
      department: 'Department'
    },
    error: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Phone number must be 10 digits',
      addressRequired: 'Address is required',
      passwordLength: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match'
    }
  },
  hi: {
    title: 'मेरी प्रोफाइल',
    subtitle: 'अपनी खाता जानकारी प्रबंधित करें',
    edit: 'प्रोफाइल संपादित करें',
    cancelEdit: 'संपादन रद्द करें',
    success: 'प्रोफाइल सफलतापूर्वक अपडेट हुई!',
    personalInfo: 'व्यक्तिगत जानकारी',
    fullName: 'पूरा नाम',
    email: 'ईमेल पता',
    phone: 'फ़ोन नंबर',
    accountType: 'खाता प्रकार',
    address: 'पता',
    changePassword: 'पासवर्ड बदलें',
    passwordHint: 'यदि आप पासवर्ड नहीं बदलना चाहते हैं तो खाली छोड़ दें',
    newPassword: 'नया पासवर्ड',
    confirmPassword: 'नए पासवर्ड की पुष्टि करें',
    newPasswordPlaceholder: 'नया पासवर्ड दर्ज करें',
    confirmPasswordPlaceholder: 'नए पासवर्ड की पुष्टि करें',
    save: 'परिवर्तन सहेजें',
    stats: 'खाता आँकड़े',
    memberSince: 'सदस्यता तिथि',
    status: 'खाता स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    userId: 'उपयोगकर्ता आईडी',
    role: {
      citizen: 'नागरिक',
      admin: 'प्रशासन',
      department: 'विभाग'
    },
    error: {
      nameRequired: 'नाम आवश्यक है',
      emailRequired: 'ईमेल आवश्यक है',
      emailInvalid: 'ईमेल अमान्य है',
      phoneRequired: 'फ़ोन नंबर आवश्यक है',
      phoneInvalid: 'फ़ोन नंबर 10 अंकों का होना चाहिए',
      addressRequired: 'पता आवश्यक है',
      passwordLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते'
    }
  }
};

const isRealisticEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z]{2,})+$/;
  if (!emailPattern.test(normalizedEmail)) return false;

  const [localPart, domain] = normalizedEmail.split('@');
  const provider = domain.split('.')[0];
  return localPart.length >= 3 && provider.length >= 2;
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
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

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('error.nameRequired');
    if (!formData.email) newErrors.email = t('error.emailRequired');
    else if (!isRealisticEmail(formData.email)) newErrors.email = t('error.emailInvalid');
    if (!formData.phone) newErrors.phone = t('error.phoneRequired');
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = t('error.phoneInvalid');
    if (!formData.address.trim()) newErrors.address = t('error.addressRequired');
    if (formData.newPassword && formData.newPassword.length < 6) newErrors.newPassword = t('error.passwordLength');
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = t('error.passwordMismatch');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const profileData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    };
    if (formData.newPassword) profileData.password = formData.newPassword;

    const result = await updateProfile(profileData);
    if (result.success) {
      setSuccess(t('success'));
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="panel p-5 sm:p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">{t('title')}</h1>
            <p className="mt-1 text-slate-600">{t('subtitle')}</p>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary flex items-center space-x-2">
            {isEditing ? <span>{t('cancelEdit')}</span> : <><FaEdit /><span>{t('edit')}</span></>}
          </button>
        </div>

        {success && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{t('personalInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.name ? 'border-red-300' : ''}`} />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-400" /></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.email ? 'border-red-300' : ''}`} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaPhone className="h-5 w-5 text-gray-400" /></div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.phone ? 'border-red-300' : ''}`} />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('accountType')}</label>
                <div className="relative">
                  <input type="text" value={t(`role.${user?.role}`)} disabled className="input-field bg-gray-50 capitalize" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none"><FaHome className="h-5 w-5 text-gray-400" /></div>
                <textarea name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} rows="3" className={`input-field pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.address ? 'border-red-300' : ''}`} />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>
          </div>

          {/* Password Change Section */}
          {isEditing && (
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-lg font-semibold text-gray-700">{t('changePassword')}</h2>
              <p className="text-sm text-gray-600">{t('passwordHint')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className={`input-field pl-10 ${errors.newPassword ? 'border-red-300' : ''}`} placeholder={t('newPasswordPlaceholder')} />
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPassword')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-300' : ''}`} placeholder={t('confirmPasswordPlaceholder')} />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {isEditing && (
            <div className="flex justify-end pt-6 border-t">
              <button type="submit" className="btn-primary flex items-center space-x-2"><FaSave /><span>{t('save')}</span></button>
            </div>
          )}
        </form>

        {/* Account Stats */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('stats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-blue-700">{t('memberSince')}</p>
              <p className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-green-700">{t('status')}</p>
              <p className="font-semibold">{user?.isActive ? t('active') : t('inactive')}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-purple-700">{t('userId')}</p>
              <p className="font-semibold truncate" title={user?._id}>{user?._id?.substring(0, 12)}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
