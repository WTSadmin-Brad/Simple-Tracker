// tailwind.config.mjs
import animatePlugin from 'tailwindcss-animate'; // Use import for ESM

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './src/app/**/*.{ts,tsx}',      // Include App Router pages/layouts
    './src/components/**/*.{ts,tsx}', // Include all components
    './src/lib/**/*.{ts,tsx}',      // Include lib utils if they use classes
    './src/hooks/**/*.{ts,tsx}',    // Include hooks if they use classes
    // Add other top-level directories in src if needed
  ],
  prefix: "", // Optional: Add prefix if needed, usually empty for shadcn
  theme: {
    container: { // Add standard container settings
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"], // Add fallback
        mono: ["var(--font-geist-mono)", "monospace"], // Add fallback
      },
      colors: {
        border: "hsl(var(--border))", // Use hsl() wrapper as per shadcn convention
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))", // Use variable if defined
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
        // Add any other custom semantic colors defined via CSS vars
      },
      borderRadius: {
        lg: "var(--radius)", // Use single --radius variable if that's how shadcn init set it up
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Or use specific variables if defined:
        // lg: "var(--radius-lg)",
        // md: "var(--radius-md)",
        // sm: "var(--radius-sm)",
      },
      keyframes: { // Add standard keyframes
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "collapsible-down": { // Added
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": { // Added
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": { // Example animation
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: { // Add standard animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out", // Added
        "collapsible-up": "collapsible-up 0.2s ease-out", // Added
        "caret-blink": "caret-blink 1.25s ease-out infinite", // Example animation
      },
    },
  },
  plugins: [animatePlugin], // Use imported plugin variable
};

export default config; // Use export default for ESM