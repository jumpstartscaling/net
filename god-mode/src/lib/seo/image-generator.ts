/**
 * SVG Featured Image Generator
 * 
 * Generates SEO-optimized featured images from templates.
 * - Replaces {title}, {subtitle}, colors, fonts
 * - Returns SVG string and base64 data URI
 * - Generates SEO-friendly filenames from titles
 */

export interface ImageGeneratorInput {
    title: string;
    subtitle?: string;
    template?: ImageTemplate;
}

export interface ImageTemplate {
    svg_source: string;
    width?: number;
    height?: number;
    background_gradient_start?: string;
    background_gradient_end?: string;
    text_color?: string;
    font_family?: string;
    title_font_size?: number;
    subtitle_text?: string;
    subtitle_font_size?: number;
}

export interface GeneratedImage {
    svg: string;
    dataUri: string;
    filename: string;
    alt: string;
    width: number;
    height: number;
}

// Default professional template
const DEFAULT_TEMPLATE: ImageTemplate = {
    svg_source: `<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{gradient_start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{gradient_end};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{width}" height="{height}" fill="url(#grad)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="{font_family}" font-weight="bold" font-size="{title_size}" fill="{text_color}">
    {title}
  </text>
  <text x="50%" y="85%" text-anchor="middle" font-family="{font_family}" font-size="{subtitle_size}" fill="rgba(255,255,255,0.7)">
    {subtitle}
  </text>
</svg>`,
    width: 1200,
    height: 630,
    background_gradient_start: '#2563eb',
    background_gradient_end: '#1d4ed8',
    text_color: '#ffffff',
    font_family: 'Arial, sans-serif',
    title_font_size: 48,
    subtitle_text: '',
    subtitle_font_size: 18
};

/**
 * Generate SEO-friendly filename from title
 * "Best Dentist in Austin, TX" -> "best-dentist-in-austin-tx.svg"
 */
export function generateFilename(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')         // Spaces to dashes
        .replace(/-+/g, '-')          // Multiple dashes to single
        .substring(0, 60)             // Limit length
        + '.svg';
}

/**
 * Wrap long titles to multiple lines if needed
 */
function wrapTitle(title: string, maxCharsPerLine: number = 40): string[] {
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
            currentLine = (currentLine + ' ' + word).trim();
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);

    return lines.slice(0, 3); // Max 3 lines
}

/**
 * Generate a featured image from a template
 */
export function generateFeaturedImage(input: ImageGeneratorInput): GeneratedImage {
    const template = input.template || DEFAULT_TEMPLATE;
    const width = template.width || 1200;
    const height = template.height || 630;

    // Process title for multi-line if needed
    const titleLines = wrapTitle(input.title);
    const isSingleLine = titleLines.length === 1;

    // Build title text elements
    let titleSvg: string;
    if (isSingleLine) {
        titleSvg = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="${template.font_family}" font-weight="bold" font-size="${template.title_font_size}" fill="${template.text_color}">${escapeXml(input.title)}</text>`;
    } else {
        const lineHeight = (template.title_font_size || 48) * 1.2;
        const startY = (height / 2) - ((titleLines.length - 1) * lineHeight / 2);
        titleSvg = titleLines.map((line, i) =>
            `<text x="50%" y="${startY + (i * lineHeight)}" dominant-baseline="middle" text-anchor="middle" font-family="${template.font_family}" font-weight="bold" font-size="${template.title_font_size}" fill="${template.text_color}">${escapeXml(line)}</text>`
        ).join('\n');
    }

    // Replace template variables
    let svg = template.svg_source
        .replace(/{width}/g, String(width))
        .replace(/{height}/g, String(height))
        .replace(/{width-80}/g, String(width - 80))
        .replace(/{height-80}/g, String(height - 80))
        .replace(/{gradient_start}/g, template.background_gradient_start || '#2563eb')
        .replace(/{gradient_end}/g, template.background_gradient_end || '#1d4ed8')
        .replace(/{text_color}/g, template.text_color || '#ffffff')
        .replace(/{accent_color}/g, template.background_gradient_start || '#2563eb')
        .replace(/{font_family}/g, template.font_family || 'Arial, sans-serif')
        .replace(/{title_size}/g, String(template.title_font_size || 48))
        .replace(/{subtitle_size}/g, String(template.subtitle_font_size || 18))
        .replace(/{title}/g, escapeXml(input.title))
        .replace(/{subtitle}/g, escapeXml(input.subtitle || template.subtitle_text || ''));

    // Generate base64 data URI for inline use
    // Use TextEncoder for Node 18+ and browser compatibility
    const encoder = new TextEncoder();
    const bytes = encoder.encode(svg);
    const base64 = btoa(String.fromCharCode(...bytes));
    const dataUri = `data:image/svg+xml;base64,${base64}`;

    return {
        svg,
        dataUri,
        filename: generateFilename(input.title),
        alt: `${input.title} - Featured Image`,
        width,
        height
    };
}

/**
 * Generate HTML img tag for the featured image
 */
export function generateImageTag(image: GeneratedImage, useSrcPath?: string): string {
    const src = useSrcPath || image.dataUri;
    return `<img src="${src}" alt="${escapeXml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" />`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
