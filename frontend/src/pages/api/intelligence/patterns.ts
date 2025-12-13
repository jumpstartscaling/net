
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    // Mock Data for Phase 4 Intelligence
    const patterns = [
        { id: '1', name: 'High-Value Listicle Structure', type: 'structure', confidence: 0.92, occurrences: 145, last_detected: '2023-10-25', tags: ['listicle', 'viral', 'b2b'] },
        { id: '2', name: 'Emotional Storytelling Hook', type: 'semantic', confidence: 0.88, occurrences: 89, last_detected: '2023-10-26', tags: ['hook', 'emotional', 'intro'] },
        { id: '3', name: 'Data-Backed CTA', type: 'conversion', confidence: 0.76, occurrences: 230, last_detected: '2023-10-24', tags: ['cta', 'sales', 'closing'] },
        { id: '4', name: 'Contrarian Viewpoint', type: 'semantic', confidence: 0.65, occurrences: 54, last_detected: '2023-10-22', tags: ['opinion', 'debate'] },
        { id: '5', name: 'How-To Guide Format', type: 'structure', confidence: 0.95, occurrences: 310, last_detected: '2023-10-27', tags: ['educational', 'long-form'] }
    ];

    const geoClusters = [
        { id: '1', name: 'North America Tech Hubs', location: '37.7749, -122.4194', audience_size: 154000, engagement_rate: 0.45, dominant_topic: 'SaaS Marketing' },
        { id: '2', name: 'London Finance Sector', location: '51.5074, -0.1278', audience_size: 89000, engagement_rate: 0.38, dominant_topic: 'FinTech' },
        { id: '3', name: 'Singapore Crypto', location: '1.3521, 103.8198', audience_size: 65000, engagement_rate: 0.52, dominant_topic: 'Web3' },
        { id: '4', name: 'Berlin Startup Scene', location: '52.5200, 13.4050', audience_size: 42000, engagement_rate: 0.41, dominant_topic: 'Growth Hacking' },
        { id: '5', name: 'Sydney E-comm', location: '-33.8688, 151.2093', audience_size: 38000, engagement_rate: 0.35, dominant_topic: 'DTC Brands' }
    ];

    const avatarMetrics = [
        { id: '1', avatar_id: 'a1', name: 'Marketing Max', articles_generated: 45, avg_engagement: 0.82, top_niche: 'SaaS Growth' },
        { id: '2', avatar_id: 'a2', name: 'Finance Fiona', articles_generated: 32, avg_engagement: 0.75, top_niche: 'Personal Finance' },
        { id: '3', avatar_id: 'a3', name: 'Tech Tyler', articles_generated: 68, avg_engagement: 0.68, top_niche: 'AI Tools' },
        { id: '4', avatar_id: 'a4', name: 'Wellness Wendy', articles_generated: 24, avg_engagement: 0.89, top_niche: 'Holistic Health' },
        { id: '5', avatar_id: 'a5', name: 'Crypto Carl', articles_generated: 15, avg_engagement: 0.45, top_niche: 'DeFi' }
    ];

    return new Response(JSON.stringify({
        patterns,
        geoClusters,
        avatarMetrics,
        isLoading: false,
        error: null
    }), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
};
