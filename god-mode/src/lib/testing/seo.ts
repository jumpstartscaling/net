
/**
 * SEO Analysis Engine
 * Checks content against common SEO best practices.
 */

interface SeoResult {
    score: number;
    issues: string[];
}

export function analyzeSeo(content: string, keyword: string): SeoResult {
    const issues: string[] = [];
    let score = 100;

    if (!content) return { score: 0, issues: ['No content provided'] };

    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // 1. Keyword Presence
    if (keyword && !lowerContent.includes(lowerKeyword)) {
        score -= 20;
        issues.push(`Primary keyword "${keyword}" is missing from content.`);
    }

    // 2. Keyword Density (Simple)
    if (keyword) {
        const matches = lowerContent.match(new RegExp(lowerKeyword, 'g'));
        const count = matches ? matches.length : 0;
        const words = content.split(/\s+/).length;
        const density = (count / words) * 100;

        if (density > 3) {
            score -= 10;
            issues.push(`Keyword density is too high (${density.toFixed(1)}%). Aim for < 3%.`);
        }
    }

    // 3. Word Count
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
        score -= 15;
        issues.push(`Content is too short (${wordCount} words). Recommended minimum is 300.`);
    }

    // 4. Heading Structure (Basic Check for H1/H2)
    // Note: If content is just body text, this might not apply suitable unless full HTML
    if (content.includes('<h1>') && (content.match(/<h1>/g) || []).length > 1) {
        score -= 10;
        issues.push('Multiple H1 tags detected. Use only one H1 per page.');
    }

    return { score: Math.max(0, score), issues };
}

/**
 * Readability Analysis Engine
 * Uses Flesch-Kincaid Grade Level
 */
export function analyzeReadability(content: string): { gradeLevel: number; score: number; feedback: string } {
    // Basic heuristics
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = countSyllables(content);

    // Flesch-Kincaid Grade Level Formula
    // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    const avgWordsPerSentence = words / Math.max(1, sentences);
    const avgSyllablesPerWord = syllables / Math.max(1, words);

    const gradeLevel = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;

    let feedback = "Easy to read";
    if (gradeLevel > 12) feedback = "Difficult (University level)";
    else if (gradeLevel > 8) feedback = "Average (High School level)";

    // Normalized 0-100 score (lower grade level = higher score usually for SEO)
    const score = Math.max(0, Math.min(100, 100 - (gradeLevel * 5)));

    return {
        gradeLevel: parseFloat(gradeLevel.toFixed(1)),
        score: Math.round(score),
        feedback
    };
}

// Simple syllable counter approximation
function countSyllables(text: string): number {
    return text.toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/e$/g, '') // silent e
        .replace(/[aeiouy]{1,2}/g, 'x') // vowel groups
        .split('x').length - 1 || 1;
}
