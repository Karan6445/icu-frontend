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
        darkSlate: '#1E293B',    // Sidebar / Nav
        deepestSlate: '#0F172A', // Main Background
        slateCard: '#334155',    // Cards
        mutedSlate: '#475569',   // Borders
        softWhite: '#F8FAFC',    // Primary Text
        skyBlue: '#38BDF8',      // Light Accent
        brand: {
          DEFAULT: '#0F766E',    // Deep Teal
          deep: '#0F766E',
          accent: '#10B981',  // Emerald Accent
          light: '#CCFBF1',
          bg: '#F3F4F6',      // Light Ash Main Background
          card: '#FFFFFF',    // Pure White Cards
          border: '#D1D5DB'   // Muted Gray Borders
        },
        clinical: {
          navy: '#0F766E',
          deep: '#0F766E',
          teal: '#0F766E',
          emerald: '#10B981',
          bg: '#F3F4F6',       // Light Ash
          card: '#FFFFFF',     // Pure White
          secondary: '#E5E7EB',
          slate: '#111827',
          muted: '#6B7280',
          border: '#D1D5DB'    // Muted Gray
        },
        status: {
          critical: {
            DEFAULT: '#EF4444', // Soft Red
            bg: '#FEF2F2',
            text: '#DC2626',
            border: '#FCA5A5'
          },
          warning: {
            DEFAULT: '#F59E0B', // Amber
            bg: '#FFFBEB',
            text: '#D97706',
            border: '#FCD34D'
          },
          high: {
            DEFAULT: '#F59E0B',
            bg: '#FFFBEB',
            text: '#D97706',
            border: '#FCD34D'
          },
          stable: {
            DEFAULT: '#10B981', // Green
            bg: '#ECFDF5',
            text: '#059669',
            border: '#6EE7B7'
          },
          neutral: {
            DEFAULT: '#9CA3AF', // Gray (Offline/Discharged)
            bg: '#F3F4F6',
            text: '#6B7280',
            border: '#D1D5DB'
          }
        },
        quality: {
          live: '#10B981',
          delayed: '#F59E0B',
          stale: '#9CA3AF',
          disconnected: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'clinical-sm': '0 1px 2px 0 rgba(30, 58, 138, 0.04)',
        'clinical-md': '0 4px 6px -1px rgba(30, 58, 138, 0.06), 0 2px 4px -2px rgba(30, 58, 138, 0.03)',
        'clinical-lg': '0 10px 15px -3px rgba(30, 58, 138, 0.08), 0 4px 6px -4px rgba(30, 58, 138, 0.04)',
        'clinical-glow': '0 0 10px rgba(30, 58, 138, 0.15)',
      }
    },
  },
  plugins: [],
}
