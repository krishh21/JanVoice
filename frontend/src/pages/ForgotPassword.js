import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/axios';

const translations = {
  en: {
    title: 'Forgot Password',
    subtitle: 'Reset your password',
    email: 'Email address',
    emailPlaceholder: 'Enter your email',
    submit: 'Send Reset Link',
    backToLogin: 'Back to Login',
    success: 'Reset link sent! Check your email.',
    error: 'Failed to send reset link. Please try again.',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email'
  },
  hi: {
    title: 'पासवर्ड भूल गए',
    subtitle: 'अपना पासवर्ड रीसेट करें',
    email: 'ईमेल पता',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',
    submit: 'रीसेट लिंक भेजें',
    backToLogin: 'लॉगिन पर वापस जाएं',
    success: 'रीसेट लिंक भेजा गया! अपना ईमेल जांचें।',
    error: 'रीसेट लिंक भेजने में विफल। कृपया पुनः प्रयास करें।',
    emailRequired: 'ईमेल आवश्यक है',
    emailInvalid: 'कृपया एक वैध ईमेल दर्ज करें'
  }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = t('emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('emailInvalid');
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
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.resetUrl) {
        // Show the reset URL directly
        setMessage(
          <div className="text-left">
            <p className="font-semibold text-green-800 mb-2">Reset link generated successfully!</p>
            <p className="text-sm text-gray-600 mb-2">Click the link below to reset your password:</p>
            <a
              href={response.data.resetUrl}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {response.data.resetUrl}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Or copy and paste this URL into your browser: {response.data.resetUrl}
            </p>
          </div>
        );
      } else {
        setMessage(t('success'));
      }
      setEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${message === t('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : t('submit')}
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

export default ForgotPassword;
