import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                surface: {
                    DEFAULT: "var(--color-surface)",
                    hover: "var(--color-surface-hover)",
                    elevated: "var(--color-surface-elevated)",
                },
                primary: {
                    DEFAULT: "var(--color-primary)",
                    light: "var(--color-primary-light)",
                    dark: "var(--color-primary-dark)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    light: "var(--color-accent-light)",
                    dark: "var(--color-accent-dark)",
                },
                text: {
                    primary: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    muted: "var(--color-text-muted)",
                }
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                display: ["var(--font-display)"],
                mono: ["var(--font-mono)"],
            },
        },
    },
    plugins: [],
};
export default config;
