import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'TaskFlow - Task Management System',
  description: 'Manage your tasks efficiently with TaskFlow',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var initialTheme = theme || systemTheme;
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={10}
            containerStyle={{
              top: 16,
              right: 16,
            }}
            toastOptions={{
              className: '',
              style: {
                background: '#ffffff',
                color: '#111827',
                minWidth: '320px',
                maxWidth: '360px',
                fontSize: '14px',
                padding: '0',
                fontWeight: '400',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                lineHeight: '1.5',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              },
              duration: 4000,
              success: {
                duration: 3000,
                style: {
                  background: '#ffffff',
                  color: '#065f46',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)',
                  padding: '0',
                  minWidth: '320px',
                  maxWidth: '360px',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 60000,
                style: {
                  background: '#ffffff',
                  color: '#991b1b',
                  border: '1px solid #ef4444',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)',
                  minWidth: '320px',
                  maxWidth: '360px',
                  padding: '0',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}


