/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAF8F4",
        ink: "#20293A",
        inkmute: "#5B6478",
        lavender: { DEFAULT: "#C6BCEF", soft: "#EDE9FB", deep: "#8B7EDB" },
        mint: { DEFAULT: "#AEE4C6", soft: "#E7F7EE" },
        skyc: { DEFAULT: "#A9CBEF", soft: "#EAF3FC" },
        peach: { DEFAULT: "#F3C7A2", soft: "#FBEEE1" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        utility: ["'Manrope'", "sans-serif"],
      },
      borderRadius: { xl2: "1.75rem", xl3: "2.25rem" },
      boxShadow: {
        calm: "0 8px 30px -12px rgba(32, 41, 58, 0.12)",
        calmLg: "0 20px 60px -20px rgba(32, 41, 58, 0.18)",
      },
      keyframes: {
        floaty: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-14px)" } },
        driftSlow: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(20px,-10px) scale(1.05)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
        breathe: { "0%, 100%": { transform: "scale(0.72)" }, "50%": { transform: "scale(1)" } },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        driftSlow: "driftSlow 14s ease-in-out infinite",
        breathe: "breathe 10s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
