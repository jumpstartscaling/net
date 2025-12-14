export interface Pattern {
    id: string;
    name: string;
    type: 'structure' | 'semantic' | 'conversion';
    confidence: number;
    occurrences: number;
    last_detected: string;
    tags: string[];
}

export interface GeoCluster {
    id: string;
    name: string;
    location: string;
    audience_size: number;
    engagement_rate: number;
    dominant_topic: string;
}

export interface AvatarMetric {
    id: string;
    avatar_id: string;
    name: string;
    articles_generated: number;
    avg_engagement: number;
    top_niche: string;
}

export interface IntelligenceState {
    patterns: Pattern[];
    geoClusters: GeoCluster[];
    avatarMetrics: AvatarMetric[];
    isLoading: boolean;
    error: string | null;
    fetchPatterns: () => Promise<void>;
    fetchGeoClusters: () => Promise<void>;
    fetchAvatarMetrics: () => Promise<void>;
}
