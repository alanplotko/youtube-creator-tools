/* eslint-disable global-require */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/line-clamp'),
  ],

  // DaisyUI config (optional)
  daisyui: {
    themes: ['corporate'],
  },
};
