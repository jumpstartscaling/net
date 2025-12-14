/**
 * Spark Pro Design System
 * Theme Configuration & Guidelines
 */

export const sparkTheme = {
    // === THE SYSTEM ===
    name: 'Titanium Pro',
    description: 'Luxury Industrial - Matte Black with Gold Accents',

    // === COLOR RULES ===
    rules: {
        surfaces: {
            void: 'bg-void',           // Pure black background
            titanium: 'bg-titanium',   // Main panels (with border)
            graphite: 'bg-graphite',   // Inputs/secondary cards
            jet: 'bg-jet',             // Popups/modals
        },

        borders: {
            standard: 'border border-edge-normal',     // All containers
            subtle: 'border border-edge-subtle',       // Dividers
            active: 'border border-edge-bright',       // Hover/focus
            selected: 'border border-edge-gold',       // Selected state
        },

        text: {
            primary: 'text-white',           // Headlines, important data
            secondary: 'text-silver',        // Body text (darkest allowed)
            data: 'text-gold-300',           // Numbers, metrics
            dimmed: 'text-white/60',         // Less important
            monospace: 'font-mono text-gold-300', // All data/numbers
        },

        shadows: {
            card: 'shadow-hard',              // Block shadow for depth
            glow: 'shadow-glow-gold',         // Glowing accent
            none: '',                         // Flat elements
        },
    },

    // === COMPONENT PATTERNS ===
    components: {
        card: 'bg-titanium border border-edge-normal shadow-hard rounded-lg',
        cardHover: 'hover:border-edge-gold transition-colors',

        button: {
            primary: 'bg-gold-gradient text-black font-semibold border-t border-white/40 shadow-glow-gold',
            secondary: 'bg-titanium border border-edge-normal hover:border-edge-bright',
            ghost: 'hover:bg-graphite',
        },

        input: 'bg-graphite border border-edge-subtle text-white placeholder:text-silver/50',

        table: {
            header: 'border-b border-edge-normal bg-titanium',
            row: 'border-b border-edge-subtle hover:bg-graphite/50',
            cell: 'border-r border-edge-subtle/50',
        },

        status: {
            active: 'bg-void border border-edge-gold text-gold-300',
            processing: 'bg-void border border-electric-400 text-electric-400 animate-pulse',
            complete: 'bg-void border border-green-500 text-green-400',
            error: 'bg-void border border-red-500 text-red-400',
        },
    },

    // === TYPOGRAPHY SYSTEM ===
    typography: {
        heading: 'font-sans tracking-tight text-white',
        body: 'font-sans text-silver',
        data: 'font-mono tracking-wider text-gold-300',
        label: 'text-silver uppercase text-[10px] tracking-[0.2em]',
    },

    // === THE "NO-BLEND" CHECKLIST ===
    checklist: [
        '✅ Every container has a 1px border',
        '✅ Never put dark on dark without border',
        '✅ Use staircase: void → titanium → graphite → jet',
        '✅ All data is monospace gold',
        '✅ Text minimum is silver (#D1D5DB)',
        '✅ Active states use gold borders',
        '✅ Shadows are hard, not fuzzy',
    ],
};

// === ALTERNATIVE THEMES (Future) ===
export const alternativeThemes = {
    'deep-ocean': {
        name: 'Deep Ocean',
        void: '#001219',
        titanium: '#0A1929',
        gold: '#00B4D8',
        description: 'Navy blue with cyan accents',
    },

    'forest-command': {
        name: 'Forest Command',
        void: '#0D1B0C',
        titanium: '#1A2E1A',
        gold: '#4ADE80',
        description: 'Dark green with emerald accents',
    },

    'crimson-steel': {
        name: 'Crimson Steel',
        void: '#0F0000',
        titanium: '#1F0A0A',
        gold: '#DC2626',
        description: 'Dark red with crimson accents',
    },
};

// === USAGE EXAMPLES ===
export const examples = {
    dashboard: {
        container: 'min-h-screen bg-void p-6',
        panel: 'bg-titanium border border-edge-normal rounded-lg p-6 shadow-hard',
        statCard: 'bg-titanium border border-edge-normal rounded-lg p-6 hover:border-edge-gold transition-colors',
        number: 'text-4xl font-mono text-gold-300 tracking-wider',
    },

    factory: {
        kanbanLane: 'bg-void/50 border-r border-edge-subtle',
        card: 'bg-titanium border border-edge-normal rounded-lg p-4 shadow-hard hover:border-edge-gold cursor-pointer',
        cardActive: 'border-edge-gold shadow-hard-gold',
    },

    form: {
        label: 'text-silver uppercase text-[10px] tracking-[0.2em] mb-2',
        input: 'bg-graphite border border-edge-subtle text-white px-4 py-2 rounded focus:border-edge-gold',
        button: 'bg-gold-gradient text-black font-semibold px-6 py-3 rounded border-t border-white/40 shadow-glow-gold',
    },
};

export default sparkTheme;
