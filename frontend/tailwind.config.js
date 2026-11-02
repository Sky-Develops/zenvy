/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zenvy: {
          obsidian: '#101014',     // Deep obsidian black
          sidebar: '#17171D',      // Sidebar & Surface Dim
          surfaceDim: '#131317',
          card: '#202027',         // Card Background
          cardElevated: '#292932', // Secondary Elevated Surface
          border: '#30303A',       // Structural Borders
          violet: '#8B5CF6',       // Vibrant Electric Violet
          violetSoft: '#A78BFA',   // Soft Lilac Violet
          mint: '#A1A1AA',         // Neutral text tone
          text: '#FFFFFF',         // Primary Typography
          muted: '#A1A1AA',        // Secondary Muted Text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
