/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a',     // Deep slate background
        panel: '#1e293b',    // Slightly lighter slate for panels
        accent: '#ef4444',   // Critical Red for alerts
        hacker: '#22c55e'    // Matrix Green for safe status
      }
    },
  },
  plugins: [],
}