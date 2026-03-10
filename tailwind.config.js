/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        pathfinder: {
          primary: "#6366f1",
          "primary-hover": "#4f46e5",
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          text: "#1e293b",
          "text-muted": "#64748b",
        },
      },
      width: {
        sidebar: "320px",
      },
    },
  },
  plugins: [],
};
