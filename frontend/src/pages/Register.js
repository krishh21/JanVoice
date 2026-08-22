import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaHome, FaLock, FaPhone, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    title: 'Create account',
    subtitle: 'Register as a citizen to report civic issues.',
    name: 'Full name',
    namePlaceholder: 'Rajesh Kumar',
    email: 'Email address',
    emailPlaceholder: 'user@example.com',
    phone: 'Mobile number',
    phonePlaceholder: '9876543210',
    address: 'Address',
    addressPlaceholder: 'House, street, area',
    password: 'Password',
    passwordPlaceholder: 'Password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Confirm password',
    submit: 'Register',
    alreadyRegistered: 'Already have an account?',
    login: 'Login',
    error: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Phone number must be 10 digits',
      addressRequired: 'Address is required',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 6 characters',
      confirmRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match'
    }
  },
  hi: {
    title: 'खाता बनाएं',
    subtitle: 'समस्या रिपोर्ट करने के लिए नागरिक के रूप में पंजीकरण करें।',
    name: 'पूरा नाम',
    namePlaceholder: 'राजेश कुमार',
    email: 'ईमेल पता',
    emailPlaceholder: 'user@example.com',
    phone: 'मोबाइल नंबर',
    phonePlaceholder: '9876543210',
    address: 'पता',
    addressPlaceholder: 'मकान, सड़क, क्षेत्र',
    password: 'पासवर्ड',
    passwordPlaceholder: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा लिखें',
    submit: 'पंजीकरण करें',
    alreadyRegistered: 'पहले से खाता है?',
    login: 'लॉगिन करें',
    error: {
      nameRequired: 'नाम आवश्यक है',
      emailRequired: 'ईमेल आवश्यक है',
      emailInvalid: 'ईमेल अमान्य है',
      phoneRequired: 'फोन नंबर आवश्यक है',
      phoneInvalid: 'फोन नंबर 10 अंकों का होना चाहिए',
      addressRequired: 'पता आवश्यक है',
      passwordRequired: 'पासवर्ड आवश्यक है',
      passwordLength: 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए',
      confirmRequired: 'कृपया पासवर्ड की पुष्टि करें',
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
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
    if (!formData.name.trim()) newErrors.name = t('error.nameRequired');
    if (!formData.email) newErrors.email = t('error.emailRequired');
    else if (!isRealisticEmail(formData.email)) newErrors.email = t('error.emailInvalid');
    if (!formData.phone) newErrors.phone = t('error.phoneRequired');
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = t('error.phoneInvalid');
    if (!formData.address.trim()) newErrors.address = t('error.addressRequired');
    if (!formData.password) newErrors.password = t('error.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('error.passwordLength');
    if (!formData.confirmPassword) newErrors.confirmPassword = t('error.confirmRequired');
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('error.passwordMismatch');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    if (result.success) navigate('/dashboard');
  };

  const fieldClass = (name) => `w-full pl-10 pr-3 py-3 border rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

  const fields = [
    { name: 'name', type: 'text', label: t('name'), placeholder: t('namePlaceholder'), icon: FaUser },
    { name: 'email', type: 'email', label: t('email'), placeholder: t('emailPlaceholder'), icon: FaEnvelope },
    { name: 'phone', type: 'tel', label: t('phone'), placeholder: t('phonePlaceholder'), icon: FaPhone, maxLength: 10 },
    { name: 'address', type: 'text', label: t('address'), placeholder: t('addressPlaceholder'), icon: FaHome },
    { name: 'password', type: 'password', label: t('password'), placeholder: t('passwordPlaceholder'), icon: FaLock },
    { name: 'confirmPassword', type: 'password', label: t('confirmPassword'), placeholder: t('confirmPasswordPlaceholder'), icon: FaLock }
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-lg rounded-xl p-6 sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-700">Citizen Registration</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(({ name, type, label, placeholder, icon: Icon, maxLength }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    className={fieldClass(name)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                  />
                </div>
                {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
              </div>
            ))}
          </div>

          <button type="submit" className="mt-7 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition">
            {t('submit')}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('alreadyRegistered')} <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">{t('login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
