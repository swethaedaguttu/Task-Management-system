'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { setTokens } from '@/lib/api';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(email, password, name);
      setTokens(response.accessToken, response.refreshToken);
      toast.success(
        <div style={{ padding: '2px 0' }}>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            marginBottom: '4px',
            color: '#065f46',
            lineHeight: '1.4',
            letterSpacing: '-0.01em'
          }}>
            Account Created!
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#047857',
            lineHeight: '1.5',
            opacity: 0.9
          }}>
            Your account has been successfully created. Welcome to TaskFlow!
          </div>
        </div>,
        {
          duration: 3000,
          style: {
            padding: '16px 18px',
          },
        }
      );
      router.push('/dashboard');
    } catch (error: any) {
      const status = error.response?.status;
      const backendError = error.response?.data?.error || '';
      
      if (error.response?.data?.errors) {
        // Dismiss any existing toasts first
        toast.dismiss();
        // Show only the first error message
        const firstError = error.response.data.errors[0];
        let errorTitle = 'Validation Error';
        let errorMessage = firstError.msg || 'Please check your input.';
        
        if (firstError.param === 'email') {
          errorTitle = 'Invalid Email';
          errorMessage = firstError.msg?.toLowerCase().includes('valid email') 
            ? 'Please enter a valid email address (e.g., user@example.com).'
            : firstError.msg || 'Please enter a valid email address.';
        } else if (firstError.param === 'password') {
          errorTitle = 'Password Error';
          errorMessage = firstError.msg?.toLowerCase().includes('length')
            ? 'Password must be at least 6 characters long. Please choose a stronger password.'
            : firstError.msg || 'Please enter a valid password.';
        } else if (firstError.param === 'name') {
          errorTitle = 'Name Required';
          errorMessage = 'Please enter your full name to continue.';
        }
        
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              {errorTitle}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              {errorMessage}
            </div>
          </div>,
          {
            duration: 5000,
            id: 'validation-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      } else if (status === 400 && backendError.toLowerCase().includes('already exists')) {
        toast.dismiss();
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              Email Already Exists
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              This email is already registered. Please use a different email or try logging in.
            </div>
          </div>,
          {
            duration: 5000,
            id: 'registration-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      } else if (status === 401) {
        toast.dismiss();
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              Invalid Credentials
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              Please check your information and try again.
            </div>
          </div>,
          {
            duration: 5000,
            id: 'registration-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      } else if (status === 500) {
        toast.dismiss();
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              Server Error
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              Something went wrong on our end. Please try again later.
            </div>
          </div>,
          {
            duration: 5000,
            id: 'registration-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      } else if (!error.response) {
        toast.dismiss();
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              Network Error
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              Please check your internet connection and try again.
            </div>
          </div>,
          {
            duration: 5000,
            id: 'registration-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      } else {
        toast.dismiss();
        toast.error(
          <div style={{ padding: '2px 0' }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '4px',
              color: '#991b1b',
              lineHeight: '1.4',
              letterSpacing: '-0.01em'
            }}>
              Registration Failed
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#7f1d1d',
              lineHeight: '1.5',
              opacity: 0.9
            }}>
              {backendError || 'Please try again.'}
            </div>
          </div>,
          {
            duration: 5000,
            id: 'registration-error',
            style: {
              padding: '16px 18px',
            },
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>Email address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-gray-700"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Password Requirements:</span>
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 ml-4">
                  <li className="flex items-center space-x-2">
                    <span className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    <span>At least 6 characters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    <span>One uppercase letter (recommended)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    <span>One lowercase letter (recommended)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    <span>One number (recommended)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    <span>One special character (recommended)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


