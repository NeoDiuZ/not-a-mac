/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float1: {
          '0%': { transform: 'translate(0%, 0%) scale(1)' },
          '25%': { transform: 'translate(100%, 50%) scale(1.1)' },
          '50%': { transform: 'translate(50%, 100%) scale(0.9)' },
          '75%': { transform: 'translate(-50%, 75%) scale(1.2)' },
          '100%': { transform: 'translate(0%, 0%) scale(1)' }
        },
        float2: {
          '0%': { transform: 'translate(0%, 0%) scale(1.1)' },
          '33%': { transform: 'translate(-75%, 25%) scale(0.9)' },
          '66%': { transform: 'translate(75%, -50%) scale(1.2)' },
          '100%': { transform: 'translate(0%, 0%) scale(1.1)' }
        },
        float3: {
          '0%': { transform: 'translate(0%, 0%) scale(0.9)' },
          '50%': { transform: 'translate(-50%, -100%) scale(1.2)' },
          '75%': { transform: 'translate(100%, -25%) scale(0.8)' },
          '100%': { transform: 'translate(0%, 0%) scale(0.9)' }
        }
      },
      animation: {
        'float1': 'float1 20s ease-in-out infinite',
        'float2': 'float2 25s ease-in-out infinite',
        'float3': 'float3 15s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};