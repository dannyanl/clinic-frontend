/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd",
          300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9",
          600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e",
        },
        accent: {
          50:  "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe",
          300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6",
          600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95",
        },
        ink: {
          50:  "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0",
          300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b",
          600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.08)",
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 8px 32px -8px rgb(15 23 42 / 0.10)",
        "ring": "0 0 0 4px rgb(14 165 233 / 0.18)",
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgb(14 165 233 / 0.12) 1px, transparent 0)",
        "brand-gradient": "linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)",
        "soft-gradient": "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)",
        "accent-gradient": "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        "rose-gradient": "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".6" } },
      },
    },
  },
  plugins: [],
};
