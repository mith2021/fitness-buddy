/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a2332',
        'bg-secondary': '#252f3d',
        'accent-primary': '#3b82f6',
        'accent-energy': '#f59e0b',
        'accent-carbs': '#06b6d4',
        'accent-fat': '#a855f7',
        'accent-protein': '#fbbf24',
      },
      fontFamily: {
        heading: 'Georgia, serif',
        body: 'system-ui, -apple-system, sans-serif',
      },
      spacing: {
        'grid': '8px',
      },
      borderRadius: {
        'card': '12px',
        'pill': '24px',
      },
    },
  },
  plugins: [],
}
