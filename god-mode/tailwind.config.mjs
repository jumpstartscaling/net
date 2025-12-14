/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    darkMode: ['class'],
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                // === THE TITANIUM PRO SYSTEM ===
                // The Void (Base Layer - Pure Black)
                void: '#000000',

                // Surface Staircase (Hard-Edge Layers)
                titanium: '#121212',   // Level 1: Main panels
                graphite: '#1C1C1E',   // Level 2: Inputs/Secondary
                jet: '#27272A',        // Level 3: Popups/Modals

                // Edge System (Borders & Separators)
                edge: {
                    subtle: 'rgba(255, 255, 255, 0.10)', // Standard borders
                    normal: 'rgba(255, 255, 255, 0.15)', // Card borders
                    bright: 'rgba(255, 255, 255, 0.30)', // Active borders
                    gold: '#D4AF37',                      // Selected state
                },

                // The Luxury (Gold Accent System)
                gold: {
                    100: '#FEF3C7', // Lightest
                    200: '#FDE68A',
                    300: '#FDE047', // Glowing text/data
                    400: '#EAB308', // Button highlight
                    500: '#D4AF37', // Antique Brass (primary)
                    600: '#B49428', // Button dark
                    700: '#A16207',
                    800: '#854D0E',
                    900: '#422006', // Deep shadow
                },

                // The Tech (Electric Blue - for live indicators)
                electric: {
                    400: '#38BDF8',
                    500: '#0EA5E9',
                },

                // Text System (High Contrast Only)
                silver: '#D1D5DB', // text-silver (darkest allowed)

                // shadcn/ui compatibility
                border: 'rgba(255, 255, 255, 0.15)',
                input: 'rgba(255, 255, 255, 0.10)',
                ring: '#D4AF37',
                background: '#000000',
                foreground: '#FFFFFF',
                primary: {
                    DEFAULT: '#D4AF37',
                    foreground: '#000000',
                },
                secondary: {
                    DEFAULT: '#1C1C1E',
                    foreground: '#FFFFFF',
                },
                destructive: {
                    DEFAULT: '#EF4444',
                    foreground: '#FFFFFF',
                },
                muted: {
                    DEFAULT: '#121212',
                    foreground: '#D1D5DB',
                },
                accent: {
                    DEFAULT: '#27272A',
                    foreground: '#FFFFFF',
                },
                popover: {
                    DEFAULT: '#27272A',
                    foreground: '#FFFFFF',
                },
                card: {
                    DEFAULT: '#121212',
                    foreground: '#FFFFFF',
                },
            },

            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['JetBrains Mono', 'Consolas', ...defaultTheme.fontFamily.mono],
            },

            backgroundImage: {
                'gold-gradient': 'linear-gradient(to bottom, #EAB308, #CA8A04)',
                'gold-gradient-r': 'linear-gradient(to right, #EAB308, #CA8A04)',
                'metal-shine': 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
                'dot-grid': 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            },

            boxShadow: {
                'glow-gold': '0 0 20px -5px rgba(212, 175, 55, 0.3)',
                'glow-blue': '0 0 20px -5px rgba(56, 189, 248, 0.3)',
                'hard': '0 4px 0 0 #1c1c1e', // Block shadow for cards
                'hard-gold': '0 4px 0 0 rgba(212, 175, 55, 0.3)',
            },

            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(--radius) - 4px)',
            },

            backgroundSize: {
                'dot-size': '20px 20px',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
}
