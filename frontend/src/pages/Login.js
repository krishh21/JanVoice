import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaUserTie, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'JanVoice',
    subtitle: 'Track local issues and get them resolved faster.',
    header: 'Welcome back',
    prompt: 'Choose how you want to sign in.',
    citizen: 'Citizen Login',
    admin: 'Admin Login',
    email: 'Email address',
    emailPlaceholder: 'user@example.com',
    password: 'Password',
    passwordPlaceholder: 'Password',
    forgot: 'Forgot password?',
    submit: 'Login',
    noAccount: "Don't have an account?",
    register: 'Register',
    error: {
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      passwordRequired: 'Password is required'
    }
  },
  hi: {
    title: 'JanVoice',
    subtitle: 'स्थानीय समस्याएं रिपोर्ट करें और समाधान ट्रैक करें।',
    header: 'वापसी पर स्वागत है',
    prompt: 'लॉगिन का तरीका चुनें।',
    citizen: 'नागरिक लॉगिन',
    admin: 'प्रशासन लॉगिन',
    email: 'ईमेल पता',
    emailPlaceholder: 'user@example.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'पासवर्ड',
    forgot: 'पासवर्ड भूल गए?',
    submit: 'लॉगिन करें',
    noAccount: 'खाता नहीं है?',
    register: 'पंजीकरण करें',
    error: {
      emailRequired: 'ईमेल आवश्यक है',
      emailInvalid: 'ईमेल अमान्य है',
      passwordRequired: 'पासवर्ड आवश्यक है'
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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [activeRole, setActiveRole] = useState('citizen');
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[language];
    for (const k of keys) {
      if (val && val[k] !== undefined) val = val[k];
      else return key;
    }
    return val;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t('error.emailRequired');
    else if (!isRealisticEmail(formData.email)) newErrors.email = t('error.emailInvalid');
    if (!formData.password) newErrors.password = t('error.passwordRequired');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.email, formData.password, activeRole);
    if (result.success) {
      navigate(activeRole === 'admin' ? '/admin' : '/dashboard');
    }
  };

  const roleOptions = [
    { id: 'citizen', label: t('citizen'), icon: FaUser },
    { id: 'admin', label: t('admin'), icon: FaUserTie }
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] bg-white border border-gray-200 shadow-xl overflow-hidden rounded-xl">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-white/15 mb-6">
              <FaShieldAlt className="text-2xl" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{t('title')}</h1>
            <p className="mt-4 text-blue-100 text-base lg:text-lg max-w-md">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {roleOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveRole(id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  activeRole === id
                    ? 'bg-white text-blue-800 border-white shadow-lg'
                    : 'bg-white/10 border-white/20 hover:bg-white/15 text-white'
                }`}
              >
                <Icon className="text-xl mb-3" />
                <span className="font-semibold text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
              {activeRole === 'admin' ? t('admin') : t('citizen')}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('header')}</h2>
            <p className="text-gray-600 mt-1">{t('prompt')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} placeholder={t('emailPlaceholder')} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="password" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} placeholder={t('passwordPlaceholder')} />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-end text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">{t('forgot')}</Link>
            </div>

            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors">{t('submit')}</button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('noAccount')} <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">{t('register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
