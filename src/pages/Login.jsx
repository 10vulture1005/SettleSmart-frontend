import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import './login.css'
import { useNavbar } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate()
  const handlecreateone = ()=>{
    navigate('/signup')
  }

  const [validation, setValidation] = useState({
    email: { isValid: null, message: '' },
    password: { isValid: null, message: '' }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateField = (field, value) => {
    let isValid = true;
    let message = '';

    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          isValid = false;
          message = 'Email is required';
        } else if (!emailRegex.test(value)) {
          isValid = false;
          message = 'Please enter a valid email address';
        } else {
          message = 'Email format is valid!';
        }
        break;

      case 'password':
        if (!value) {
          isValid = false;
          message = 'Password is required';
        } else if (value.length < 6) {
          isValid = false;
          message = 'Password must be at least 6 characters';
        } else {
          message = 'Password looks good!';
        }
        break;
    }

    return { isValid, message };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const validationResult = validateField(field, value);
    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const allValid = Object.keys(formData).every(field => {
      const validationResult = validateField(field, formData[field]);
      setValidation(prev => ({ ...prev, [field]: validationResult }));
      return validationResult.isValid;
    });

    if (allValid) {
      setIsSubmitting(true);
      
      const data = formData;
      //  API call
        try {
        const res = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/auth/login`,
          data
        );
        console.log(`✅ Login success! Welcome, ${res.data.name}`);
        console.log(res.data);
        const id = res.data.id;

        navigate(`/Display/`)
      } catch (err) {
        console.log(
          `❌ Login failed: ${err.response?.data?.message || err.message}`
        );
      }
      
    } else {
      alert('Please fix the errors before submitting.');
    }
  };

  const isFormValid = Object.keys(formData).every(field => 
    formData[field].trim() && validation[field].isValid
  );

  return (
    <div className="min-h-screen flex items-center overflow-hidden justify-center p-5" 
         style={{ 
           background: '#161a1d',
         }}>
      <div className="w-full max-w-md">
        <div 
          className="rounded-3xl p-10 shadow-xl relative overflow-hidden"
          style={{ 
            backgroundColor: '#272d32',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Top border accent */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #9bdab2, rgba(155, 218, 178, 0.6))' }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 
              className="text-4xl font-extrabold mb-2"
              style={{ 
                background: 'linear-gradient(135deg, #f9fafb, #9bdab2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Welcome Back
            </h1>
            <p className="text-lg" style={{ color: '#a3a3a8' }}>
              Sign in to your account
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} style={{ color: '#a3a3a8' }} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.email.isValid === true 
                      ? 'border-green-500' 
                      : validation.email.isValid === false 
                      ? 'border-red-500' 
                      : 'border-transparent'
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{ 
                    backgroundColor: '#2d3339',
                    color: '#f9fafb'
                  }}
                />
              </div>
              {validation.email.message && (
                <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  validation.email.isValid 
                    ? 'bg-green-500 bg-opacity-10 border-l-4 border-green-500' 
                    : 'bg-red-500 bg-opacity-10 border-l-4 border-red-500'
                }`}>
                  {validation.email.isValid ? 
                    <Check size={16} className="text-green-500" /> : 
                    <AlertCircle size={16} className="text-red-500" />
                  }
                  <span style={{ color: validation.email.isValid ? '#9bdab2' : '#ef4444' }}>
                    {validation.email.message}
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#f9fafb' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} style={{ color: '#a3a3a8' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl text-base transition-all duration-300 outline-none border-2 ${
                    validation.password.isValid === true 
                      ? 'border-green-500' 
                      : validation.password.isValid === false 
                      ? 'border-red-500' 
                      : 'border-transparent'
                  } focus:border-green-400 focus:shadow-lg focus:-translate-y-0.5`}
                  style={{ 
                    backgroundColor: '#2d3339',
                    color: '#f9fafb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validation.password.message && (
                <div className={`mt-2 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  validation.password.isValid 
                    ? 'bg-green-500 bg-opacity-10 border-l-4 border-green-500' 
                    : 'bg-red-500 bg-opacity-10 border-l-4 border-red-500'
                }`}>
                  {validation.password.isValid ? 
                    <Check size={16} className="text-green-500" /> : 
                    <AlertCircle size={16} className="text-red-500" />
                  }
                  <span style={{ color: validation.password.isValid ? '#9bdab2' : '#ef4444' }}>
                    {validation.password.message}
                  </span>
                </div>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-gray-400 text-green-400 focus:ring-green-400 focus:ring-2"
                  style={{ 
                    backgroundColor: rememberMe ? '#9bdab2' : '#2d3339',
                    borderColor: rememberMe ? '#9bdab2' : '#a3a3a8'
                  }}
                />
                <span className="text-sm" style={{ color: '#f9fafb' }}>
                  Remember me
                </span>
              </label>
              <button 
                onClick={() => alert('Redirecting to password reset...')}
                className="text-sm font-semibold transition-colors duration-200 hover:opacity-80"
                style={{ color: '#9bdab2' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-5 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300 ${
                isFormValid && !isSubmitting
                  ? 'transform hover:-translate-y-1 hover:shadow-2xl' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, #9bdab2, rgba(155, 218, 178, 0.8))',
                color: '#161a1d'
              }}
            >
              {'Sign In'}
            </button>

            {/* Social Login Options */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#2d3339' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ backgroundColor: '#272d32', color: '#a3a3a8' }}>
                  Or continue with
                </span>
              </div>
            </div> */}

            {/* <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => alert('Google login integration needed')}
                className="py-3 px-4 rounded-xl border-2 border-transparent transition-all duration-300 hover:border-green-400 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                style={{ backgroundColor: '#2d3339' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span style={{ color: '#f9fafb' }}>Google</span>
              </button>
              <button
                onClick={() => alert('GitHub login integration needed')}
                className="py-3 px-4 rounded-xl border-2 border-transparent transition-all duration-300 hover:border-green-400 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                style={{ backgroundColor: '#2d3339' }}
              >
                <svg className="w-5 h-5" fill="#f9fafb" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span style={{ color: '#f9fafb' }}>GitHub</span>
              </button>
            </div> */}
          </div>

          {/* Signup Link */}
          <div className="text-center mt-8 pt-8 border-t" style={{ borderColor: '#2d3339' }}>
            <p style={{ color: '#a3a3a8' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => handlecreateone()}
                className="font-semibold transition-colors duration-200 hover:opacity-80"
                style={{ color: '#9bdab2' }}
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;