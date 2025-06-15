/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: "#333333",
          gold: "#A4863D",
          light: "#E6E6FA",
          forest: "#0E300E",
        },
      },
      perspective: {
        1000: "1000px",
        1500: "1500px",
      },
      transformStyle: {
        "3d": "preserve-3d",
      },
      keyframes: {
        "scale-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "scale-in": "scale-in 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      boxShadow: {
        "3d": "0 20px 40px rgba(0, 0, 0, 0.1), 0 15px 12px rgba(0, 0, 0, 0.05)",
        "3d-hover":
          "0 30px 60px rgba(0, 0, 0, 0.15), 0 20px 20px rgba(0, 0, 0, 0.1)",
        "luxury-gold": "0 10px 30px rgba(164, 134, 61, 0.3)",
      },
    },
  },
  plugins: [],
};
