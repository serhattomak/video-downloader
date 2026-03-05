/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Soft Swiss Design Palette - Eye Friendly
        soft: {
          bg: {
            primary: '#FAFAFA',    // Very light warm gray
            secondary: '#F5F5F5',  // Light gray
            card: '#FFFFFF',       // White cards
          },
          text: {
            primary: '#1F2937',    // Dark gray (not pure black)
            secondary: '#4B5563',   // Medium gray
            muted: '#9CA3AF',       // Light gray
          },
          border: {
            default: '#E5E7EB',    // Light border
            hover: '#D1D5DB',       // Hover border
            active: '#9CA3AF',      // Active border
          },
          accent: {
            primary: '#2563EB',    // Blue accent
            hover: '#1D4ED8',       // Darker blue
            light: '#DBEAFE',       // Light blue background
          },
          success: '#059669',
          warning: '#D97706',
          error: '#DC2626',
        },
        // Keep dark palette for compatibility
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
