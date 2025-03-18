module.exports = {
  content: [
    './resources/**/*.php',
    './resources/**/*.js',
    './resources/**/*.ts',
    './resources/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        'planet-blue': '#0042a5',
        'planet-green': '#22a51e',
        'planet-brown': '#8b4513',
        'planet-snow': '#ffffff',
        'planet-beach': '#cc7700',
      },
      height: {
        'planet-sm': '300px',
        'planet-md': '500px',
        'planet-lg': '700px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable base styles to prevent conflicts with WordPress themes
  },
  prefix: 'bp-', // Add a prefix to prevent conflicts with theme styles
}; 