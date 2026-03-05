/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./routes/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'blush-pink': 'var(--blush-pink)',
        'soft-white': 'var(--soft-white)',
        'accent-pink': 'var(--accent-pink)',
        'dark-charcoal': 'var(--dark-charcoal)',
        'muted-gray': 'var(--muted-gray)',
      },
    },
  },
  plugins: [],
}
