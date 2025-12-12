/**
 * USA Territory Map Component
 * 
 * Interactive map showing campaign coverage by state.
 * Uses React-Leaflet for rendering.
 */
import React, { useEffect, useState } from 'react';

interface StateData {
    state: string;
    code: string;
    articleCount: number;
    status: 'empty' | 'active' | 'saturated';
}

interface WarMapProps {
    onStateClick?: (stateCode: string) => void;
}

// US State coordinates (simplified centroids)
const STATE_COORDS: Record<string, [number, number]> = {
    'AL': [32.806671, -86.791130], 'AK': [61.370716, -152.404419],
    'AZ': [33.729759, -111.431221], 'AR': [34.969704, -92.373123],
    'CA': [36.116203, -119.681564], 'CO': [39.059811, -105.311104],
    'CT': [41.597782, -72.755371], 'DE': [39.318523, -75.507141],
    'FL': [27.766279, -81.686783], 'GA': [33.040619, -83.643074],
    'HI': [21.094318, -157.498337], 'ID': [44.240459, -114.478828],
    'IL': [40.349457, -88.986137], 'IN': [39.849426, -86.258278],
    'IA': [42.011539, -93.210526], 'KS': [38.526600, -96.726486],
    'KY': [37.668140, -84.670067], 'LA': [31.169546, -91.867805],
    'ME': [44.693947, -69.381927], 'MD': [39.063946, -76.802101],
    'MA': [42.230171, -71.530106], 'MI': [43.326618, -84.536095],
    'MN': [45.694454, -93.900192], 'MS': [32.741646, -89.678696],
    'MO': [38.456085, -92.288368], 'MT': [46.921925, -110.454353],
    'NE': [41.125370, -98.268082], 'NV': [38.313515, -117.055374],
    'NH': [43.452492, -71.563896], 'NJ': [40.298904, -74.521011],
    'NM': [34.840515, -106.248482], 'NY': [42.165726, -74.948051],
    'NC': [35.630066, -79.806419], 'ND': [47.528912, -99.784012],
    'OH': [40.388783, -82.764915], 'OK': [35.565342, -96.928917],
    'OR': [44.572021, -122.070938], 'PA': [40.590752, -77.209755],
    'RI': [41.680893, -71.511780], 'SC': [33.856892, -80.945007],
    'SD': [44.299782, -99.438828], 'TN': [35.747845, -86.692345],
    'TX': [31.054487, -97.563461], 'UT': [40.150032, -111.862434],
    'VT': [44.045876, -72.710686], 'VA': [37.769337, -78.169968],
    'WA': [47.400902, -121.490494], 'WV': [38.491226, -80.954453],
    'WI': [44.268543, -89.616508], 'WY': [42.755966, -107.302490]
};

const STATE_NAMES: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming'
};

export const WarMap: React.FC<WarMapProps> = ({ onStateClick }) => {
    const [stateData, setStateData] = useState<StateData[]>([]);
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStateData();
    }, []);

    const loadStateData = async () => {
        try {
            const response = await fetch('/api/seo/coverage-by-state');
            const data = await response.json();

            if (data.states) {
                setStateData(data.states);
            } else {
                // Generate mock data for demo
                const mockData = Object.entries(STATE_COORDS).map(([code]) => ({
                    state: STATE_NAMES[code] || code,
                    code,
                    articleCount: Math.floor(Math.random() * 500),
                    status: ['empty', 'active', 'saturated'][Math.floor(Math.random() * 3)] as any
                }));
                setStateData(mockData);
            }
        } catch (err) {
            console.error('Failed to load state data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStateColor = (status: string): string => {
        switch (status) {
            case 'saturated': return '#ef4444'; // Red
            case 'active': return '#22c55e'; // Green
            default: return '#6b7280'; // Gray
        }
    };

    const getStateSize = (count: number): number => {
        if (count > 200) return 24;
        if (count > 100) return 20;
        if (count > 50) return 16;
        if (count > 0) return 12;
        return 8;
    };

    if (loading) {
        return (
            <div className="war-map-loading">
                <span>Loading territory map...</span>
            </div>
        );
    }

    return (
        <div className="war-map-container">
            <svg
                viewBox="0 0 960 600"
                className="war-map-svg"
                style={{ width: '100%', height: '400px' }}
            >
                {/* Simplified US outline */}
                <rect x="0" y="0" width="960" height="600" fill="#0a0a0f" />

                {/* State markers */}
                {stateData.map((state) => {
                    const coords = STATE_COORDS[state.code];
                    if (!coords) return null;

                    // Convert lat/lng to SVG coordinates (simplified)
                    const x = ((coords[1] + 125) / 60) * 900 + 30;
                    const y = ((50 - coords[0]) / 25) * 500 + 50;
                    const size = getStateSize(state.articleCount);
                    const color = getStateColor(state.status);

                    return (
                        <g
                            key={state.code}
                            className="state-marker"
                            onClick={() => onStateClick?.(state.code)}
                            onMouseEnter={() => setHoveredState(state.code)}
                            onMouseLeave={() => setHoveredState(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            <circle
                                cx={x}
                                cy={y}
                                r={size}
                                fill={color}
                                opacity={hoveredState === state.code ? 1 : 0.7}
                                stroke={hoveredState === state.code ? '#fff' : 'transparent'}
                                strokeWidth={2}
                            />
                            <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="10"
                                fontWeight="bold"
                            >
                                {state.code}
                            </text>

                            {hoveredState === state.code && (
                                <g>
                                    <rect
                                        x={x - 50}
                                        y={y - 50}
                                        width={100}
                                        height={35}
                                        rx={4}
                                        fill="#1a1a2e"
                                        stroke="#333"
                                    />
                                    <text x={x} y={y - 35} textAnchor="middle" fill="#fff" fontSize="12">
                                        {state.state}
                                    </text>
                                    <text x={x} y={y - 20} textAnchor="middle" fill="#888" fontSize="10">
                                        {state.articleCount} articles
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="map-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#6b7280' }}></span>
                    <span>No Coverage</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#22c55e' }}></span>
                    <span>Active Campaign</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                    <span>Saturated</span>
                </div>
            </div>

            <style>{`
                .war-map-container {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 20px;
                }
                .war-map-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    color: #888;
                }
                .war-map-svg {
                    border-radius: 8px;
                }
                .state-marker {
                    transition: all 0.2s ease;
                }
                .map-legend {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 16px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #888;
                }
                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default WarMap;
