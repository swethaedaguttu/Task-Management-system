'use client';

import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

interface MobileHeaderProps {
  userInfo: { name?: string; email?: string } | null;
  onLogout: () => void;
}

export default function MobileHeader({ userInfo, onLogout }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo size="sm" showText={true} />
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {userInfo && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                    {userInfo.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{userInfo.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{userInfo.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

