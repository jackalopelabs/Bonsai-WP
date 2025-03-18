/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/scripts/**/*.{js,ts,jsx,tsx}',
    './resources/views/**/*.php',
    './resources/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        'planet-blue': '#3399ff',
        'planet-green': '#4d9a4d',
        'planet-brown': '#8c7853',
        'planet-atmosphere': '#88aaff',
      },
      boxShadow: {
        'planet': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'planet-hover': '0 6px 12px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'blink': 'blink 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
  // Use a prefix to prevent conflicts with WordPress themes
  prefix: 'bp-',
  safelist: [
    // Layout
    'bp-relative', 'bp-absolute', 'bp-inset-0', 'bp-flex', 'bp-items-center',
    'bp-justify-center', 'bp-text-center', 'bp-flex-col', 'bp-block',
    'bp-w-full', 'bp-h-full', 'bp-overflow-hidden', 'bp-outline-none',
    // Spacing
    'bp-p-2', 'bp-p-5', 'bp-mb-2', 'bp-mb-4', 'bp-my-1', 'bp-my-4',
    'bp-min-h-[200px]', 'bp-min-h-[250px]', 'bp-min-h-[300px]',
    // Appearance
    'bp-border', 'bp-border-dashed', 'bp-border-gray-300', 'bp-border-blue-500',
    'bp-rounded-lg', 'bp-rounded-full',
    'bp-bg-black', 'bp-bg-white', 'bp-bg-opacity-5', 'bp-bg-opacity-70', 'bp-bg-opacity-90',
    'bp-border-gray-200', 'bp-border-t-blue-500', 'bp-border-4',
    // Typography
    'bp-text-blue-500', 'bp-text-gray-600', 'bp-text-red-500', 'bp-text-sm',
    'bp-text-base', 'bp-text-xs', 'bp-text-5xl', 'bp-font-medium',
    // Effects
    'bp-shadow-planet', 'bp-shadow-planet-hover', 'bp-animate-spin-slow',
    'bp-opacity-70', 'bp-transition-all', 'bp-duration-200', 'bp-duration-300',
    // Z-index
    'bp-z-10', 'bp-z-20',
    // Width/Height
    'bp-w-10', 'bp-h-10', 'bp-w-full'
  ]
} 