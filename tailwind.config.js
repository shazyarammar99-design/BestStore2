/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        krylo: {
          bg: '#020202',
          elevated: '#0A0A0A',
          surface: '#111111',
          blue: '#0084FF',
          copper: '#C87941',
          text: '#FFFFFF',
          muted: '#8A8A8A',
          caption: '#5C5C5C',
          border: '#2A2A2A',
        },
        best: {
          bg: '#0B0C10',
          elevated: '#11131A',
          surface: '#161925',
          cyan: '#00F0FF',
          purple: '#B026FF',
          gold: '#FFD700',
          text: '#FFFFFF',
          muted: '#8B93A7',
          caption: '#5E6678',
          border: '#1E2230',
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'card-glow': '0 0 40px rgba(0, 132, 255, 0.08)',
        'cta-glow': '0 0 30px rgba(200, 121, 65, 0.25)',
        'cyan-glow': '0 0 30px rgba(0, 240, 255, 0.25)',
        'cyan-glow-lg': '0 0 50px rgba(0, 240, 255, 0.4)',
        'purple-glow': '0 0 30px rgba(176, 38, 255, 0.3)',
        'purple-glow-lg': '0 0 50px rgba(176, 38, 255, 0.45)',
        'gold-glow': '0 0 30px rgba(255, 215, 0, 0.3)',
        'gold-glow-lg': '0 0 45px rgba(255, 215, 0, 0.5)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-dot": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(34px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)" },
          "50%": { boxShadow: "0 0 45px rgba(255, 215, 0, 0.6)" },
        },
        "pulse-glow-cyan": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)" },
          "50%": { boxShadow: "0 0 35px rgba(0, 240, 255, 0.45)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(120%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "marquee": "marquee 30s linear infinite",
        "scroll-dot": "scroll-dot 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-cyan": "pulse-glow-cyan 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "ticker": "ticker 25s linear infinite",
        "slide-in-right": "slide-in-right 0.45s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
