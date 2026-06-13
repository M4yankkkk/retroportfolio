/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crt: {
          green: '#33ff33',
          amber: '#ffb000',
          dim: '#1a3a1a',
          bg: '#0a0a0a',
          surface: '#1a1a1a',
        },
      },
      fontFamily: {
        terminal: ['"VT323"', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        scanline: 'scanline 8s linear infinite',
        flicker: 'flicker 0.15s infinite',
        'float-up': 'float-up 6s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
          '25%': { opacity: '0.98' },
          '75%': { opacity: '0.99' },
        },
        'float-up': {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.3' },
          '50%': { transform: 'translateY(-20px)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
