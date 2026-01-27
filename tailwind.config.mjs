/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#38bdf8"
        }
      },
      maxWidth: {
        "content": "72rem"
      }
    }
  },
  plugins: []
};

export default config;
