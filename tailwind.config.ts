import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        surface: "#FFFFFF",
        brand: {
          50: '#EAF3DE', 100: '#C0DD97', 400: '#639922', 600: '#3B6D11', 800: '#27500A',
        },
        teal: {
          50: '#E1F5EE', 100: '#9FE1CB', 400: '#1D9E75', 600: '#0F6E56', 800: '#085041',
        },
        amber: {
          50: '#FAEEDA', 100: '#FAC775', 400: '#BA7517', 600: '#854F0B',
        },
        coral: {
          50: '#FAECE7', 100: '#F5C4B3', 400: '#D85A30', 600: '#993C1D',
        },
        slate: {
          50: '#F1EFE8', 100: '#D3D1C7', 400: '#888780', 800: '#444441',
        },
        accent: {
          DEFAULT: '#1D9E75',
          dark: '#0F6E56',
        },
        muted: '#888780',
        border: 'rgba(60,55,40,0.12)',
        'border-md': 'rgba(60,55,40,0.2)',
        star: '#EF9F27',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        lg: '0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
      },
      animation: {
        'float-up': 'floatUp 0.7s ease 0.3s both',
        'fade-in-up': 'fadeInUp 0.6s ease both',
      },
      keyframes: {
        floatUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
