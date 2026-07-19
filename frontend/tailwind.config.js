/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          primary: "#2563eb",
          low: "#22c55e",
          medium: "#eab308",
          high: "#f97316",
          critical: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
