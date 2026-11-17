// Tailwind CDN config. Must load BEFORE the Tailwind script tag.
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d7f5e2',
          500: '#1f9d55',
          600: '#17803f',
          800: '#0f4d2c',
          900: '#0a331e',
        },
        accent: '#f5c842',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
};
