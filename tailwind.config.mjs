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
        },
        // Sval, tillfredsställande accent (mjuk cyan–blå)
        cool: {
          50: "#f0fdfc",
          100: "#ccfbf7",
          200: "#99f6ed",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a"
        }
      },
      maxWidth: {
        "content": "72rem"
      },
      keyframes: {
        "testimonial-slide-in": {
          "0%": { opacity: "0.6", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "testimonial-slide-in-prev": {
          "0%": { opacity: "0.6", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        "testimonial-slide": "testimonial-slide-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "testimonial-slide-prev": "testimonial-slide-in-prev 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }
    }
  },
  plugins: []
};

export default config;
