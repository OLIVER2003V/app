/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Tema Oscuro Principal (Admin/Places/Events) ---
        dark: {
          bg: '#0b1220',       // --ad-bg
          panel: '#0f172a',    // --ad-panel
          panel2: '#111827',   // --ad-panel-2
          border: '#243047',  // --ad-border
          surface: '#141518', // --surface (de Places.css)
        },
        // --- Colores de Texto Base (Tema Oscuro) ---
        text: {
          DEFAULT: '#f5f7fa', // Texto principal (claro)
          light: '#e5e7eb',
          dim: '#9ca3af',      // --ad-dim
          muted: '#9aa0a6',   // --muted
        },
        // --- Tema Claro Principal (Home) ---
        background: '#f7fbf8', // --background-color
        'alt-bg': '#e8f5e9',   // --alt-background-color

        // --- Paleta Primaria (Eco) ---
        primary: {
          DEFAULT: '#2e7d32',
          100: '#e8f5e9',
          200: '#a5d6a7',
          600: '#1b5e20',
        },
        // --- Paleta de Acentos (Combinada) ---
        accent: {
          DEFAULT: '#ff8a00', // Acento Eco (naranja)
          600: '#ef6c00',
          blue: '#60a5fa',    // Acento Admin (azul)
          violet: '#a78bfa',
          green: '#34d399',
          amber: '#fbbf24',
          red: '#f87171',
        },
        
        // --- COLORES DE CATEGORÍA (Esta es la parte que falta) ---
        category: {
          mirador: '#8e44ad',
          cascada: '#3498db',    // Usado en @apply bg-category-cascada
          ruta: '#e67e22',
          gastronomia: '#e74c3c', // Usado en @apply bg-category-gastronomia
          hospedaje: '#1abc9c',
          otro: '#7f8c8d',
        },
        // --- Borde Transparente (Places) ---
        // ▼▼▼ ¡ESTA FUE LA LÍNEA CORREGIDA! ▼▼▼
        border: '#ffffff18',
      },
      borderRadius: {
        lg: '14px', // 14px (admin)
        md: '10px', // 10px (admin-sm)
        sm: '10px', // 10px (home-sm)
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        hover: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.07)',
        'focus-ring': '0 0 0 3px rgba(46,125,50,.3)',
        admin: '0 10px 30px rgba(3, 7, 18, 0.45)', // --ad-shadow
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(.2,.8,.2,1)',
      },
      backgroundImage: {
        'admin-gradient': 'radial-gradient(1200px 800px at 10% -10%, #1e293b 0%, transparent 50%), radial-gradient(900px 600px at 110% 10%, #3730a3 0%, transparent 50%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}