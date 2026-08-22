import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/axios';

const translations = {
  en: {
    title: 'Reset Password',
    subtitle: 'Enter your new password',
    password: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordPlaceholder: 'Enter new password',
    confirmPlaceholder: 'Confirm new password',
    submit: 'Reset Password',
    backToLogin: 'Back to Login',
    success: 'Password reset successful! You can now login.',
    error: 'Failed to reset password. Please try again.',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordsNotMatch: 'Passwords do not match',
    invalidToken: 'Invalid or expired reset token'
  },
  hi: {
    title: 'पासवर्ड रीसेट करें',
    subtitle: 'अपना नया पासवर्ड दर्ज करें',
    password: 'नया पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    passwordPlaceholder: 'नया पासवर्ड दर्ज करें',
    confirmPlaceholder: 'नया पासवर्ड पुष्टि करें',
    submit: 'पासवर्ड रीसेट करें',
    backToLogin: 'लॉगिन पर वापस जाएं',
    success: 'पासवर्ड रीसेट सफल! अब आप लॉगिन कर सकते हैं।',
    error: 'पासवर्ड रीसेट करने में विफल। कृपया पुनः प्रयास करें।',
    passwordRequired: 'पासवर्ड आवश्यक है',
    passwordMinLength: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    passwordsNotMatch: 'पासवर्ड मेल नहीं खाते',
    invalidToken: 'अमान्य या समाप्त रीसेट टोकन'
  }
};

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useCallback((key) => translations[language][key] || key, [language]);

  useEffect(() => {
    if (!resettoken) {
      setMessage(t('invalidToken'));
    }
  }, [resettoken, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = t('passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('passwordMinLength');
    if (!formData.confirmPassword) newErrors.confirmPassword = t('passwordRequired');
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('passwordsNotMatch');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      await api.put(`/auth/reset-password/${resettoken}`, { password: formData.password });
      setMessage(t('success'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Product Banner */}
        <div className="bg-blue-800 text-white rounded-t-xl p-6 text-center mb-6">
          <h1 className="text-xl font-bold">JanVoice</h1>
          <p className="text-blue-200 text-sm">Password Reset</p>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('confirmPlaceholder')}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${message === t('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !resettoken}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Resetting...' : t('submit')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <FaArrowLeft className="mr-2" />
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
