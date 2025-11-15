'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from the class already set by the script tag
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    // Check if dark class is already on the document (set by script tag)
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    // Fallback to localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return systemTheme;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync theme state with what's already on the document
    if (typeof window !== 'undefined') {
      const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setTheme(currentTheme);
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    updateTheme(newTheme);
  };

  // Provide default context even when not mounted to prevent errors
  const contextValue: ThemeContextType = {
    theme: mounted ? theme : 'light',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

