// frontend/tailwind.config.js
// ══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS
// ══════════════════════════════════════════════════════════════════════════════
// This configuration establishes a consistent design language for the application.
// All spacing, typography, and colors follow intentional scales.
// ══════════════════════════════════════════════════════════════════════════════

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Typography Scale ─────────────────────────────────────────────────────
      // Uses Inter with optimized font features for UI
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Sidebar typography scale
        'sidebar-xs': ['0.6875rem', '1rem'],    // 11px/16px - Labels, roles
        'sidebar-sm': ['0.8125rem', '1.25rem'], // 13px/20px - Nav items, user
        'sidebar-base': ['0.875rem', '1.25rem'], // 14px/20px - Brand
      },

      // ── Spacing Scale ────────────────────────────────────────────────────────
      // 4px base grid for precise alignment
      spacing: {
        'sidebar-px': '0.75rem',     // 12px - Horizontal padding
        'sidebar-py': '1rem',        // 16px - Vertical padding  
        'sidebar-gap': '0.75rem',    // 12px - Gap between items
        'sidebar-icon': '1.125rem',  // 18px - Icon size
      },

      // ── Animation ────────────────────────────────────────────────────────────
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ── Color Palette ────────────────────────────────────────────────────────
      // Primary cyan — vibrant, modern, IoT-focused
      // This establishes a consistent cyan accent throughout the app
      colors: {
        // Primary brand cyan — rich and saturated
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // Main accent
          600: '#0891b2',  // Hover/focus
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Keep blue for secondary use
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Semantic sidebar colors (for component-level tokens)
        sidebar: {
          bg: 'var(--sidebar-bg)',
          border: 'var(--sidebar-border)',
          text: 'var(--sidebar-text)',
          'text-muted': 'var(--sidebar-text-muted)',
          'text-faded': 'var(--sidebar-text-faded)',
          'nav-hover': 'var(--sidebar-nav-hover)',
          'nav-active': 'var(--sidebar-nav-active)',
          accent: 'var(--sidebar-accent)',
          'accent-muted': 'var(--sidebar-accent-muted)',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        iset: {
          // ── Base surfaces — clean white/light ──────────────────
          'base-100': '#ffffff',   // Main background (pure white)
          'base-200': '#f8fafc',   // Card / sidebar background (slate-50)
          'base-300': '#e2e8f0',   // Border / divider (slate-200)
          'base-content': '#0f172a', // Body text (slate-900)

          // ── Accent system — vibrant cyan ───────────────────────
          primary: '#0891b2',      // Cyan 600 — primary accent
          'primary-focus': '#0e7490', // Cyan 700
          'primary-content': '#ffffff',

          secondary: '#06b6d4',    // Cyan 500
          'secondary-focus': '#0891b2',
          'secondary-content': '#ffffff',

          accent: '#22d3ee',       // Cyan 400 — for highlights
          'accent-focus': '#06b6d4',
          'accent-content': '#164e63',

          neutral: '#f1f5f9',      // slate-100
          'neutral-focus': '#e2e8f0',
          'neutral-content': '#334155',

          // ── Semantic colors ────────────────────────────────────
          info: '#0ea5e9',    // sky-500
          success: '#10b981', // emerald-500
          warning: '#f59e0b', // amber-500
          error: '#ef4444',   // red-500

          // ── Sidebar Design Tokens ──────────────────────────────
          '--sidebar-bg': '#f8fafc',
          '--sidebar-border': '#e2e8f0',
          '--sidebar-text': '#0f172a',
          '--sidebar-text-muted': '#64748b',     // slate-500
          '--sidebar-text-faded': '#94a3b8',     // slate-400
          '--sidebar-nav-hover': 'rgba(8, 145, 178, 0.06)',   // cyan-600/6%
          '--sidebar-nav-active': 'rgba(8, 145, 178, 0.1)',   // cyan-600/10%
          '--sidebar-accent': '#0891b2',         // cyan-600
          '--sidebar-accent-muted': '#67e8f9',   // cyan-300

          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '9999px',
          '--animation-btn': '0.15s',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
    ],
    darkTheme: false,   // No dark-mode switching
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};
