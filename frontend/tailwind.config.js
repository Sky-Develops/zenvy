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
          obsidian: '#121214',     // Background Utama (Obsidian Matte)
          surface: '#1C1C1F',      // Surface / Card (Charcoal Slate)
          card: '#1C1C1F',         // Surface / Card (Charcoal Slate)
          sidebar: '#121214',      // Obsidian Matte
          surfaceDim: '#121214',
          elevated: '#27272B',     // Elevated Surface (Graphite)
          cardElevated: '#27272B', // Elevated Surface (Graphite)
          border: '#27272B',       // Subtle Graphite Border (hanya untuk elemen yang butuh)
          primary: '#047857',      // Primary Accent (Deep Emerald, darker than #059669 / #10B981)
          mint: '#047857',         // Deep Emerald
          secondary: '#38BDF8',    // Secondary Accent (Steel Blue)
          steel: '#38BDF8',        // Steel Blue
          text: '#F4F4F5',         // Teks Utama (Off-White)
          muted: '#A1A1AA',        // Teks Sekunder (Muted Zinc)
          violet: '#047857',       // Backward compat -> Primary Accent
          violetSoft: '#38BDF8',   // Backward compat -> Secondary Accent
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
