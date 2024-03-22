/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          shade: 'rgba(var(--primary), 0.6)',
        },
        plain: {
          DEFAULT: 'rgb(var(--plain-color))',
          shade: 'rgba(var(--plain-color), 0.5)',
        },
        contrast: 'rgb(var(--contrast-color))',
      },
    },
  },
  plugins: [],
};
