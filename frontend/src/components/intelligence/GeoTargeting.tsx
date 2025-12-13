import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, Users, MapPin } from 'lucide-react';
import type { GeoCluster } from '@/lib/intelligence/types';

// Fix for default marker icons in Leaflet with Next.js/Webpack
// Bubbling up this style import to a global effect might be needed, but local import helps
// Note: We use CircleMarkers to avoid the icon image loading issue altogether for this implementation

interface GeoTargetingProps {
    clusters: GeoCluster[];
    isLoading?: boolean;
}

const SetViewOnClick = ({ coords, zoom }: { coords: [number, number], zoom: number }) => {
    const map = useMap();
    map.setView(coords, zoom);
    return null;
}

const GeoTargeting = ({ clusters, isLoading = false }: GeoTargetingProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (isLoading) {
        return (
            <Card className="h-[500px] flex items-center justify-center border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Globe className="h-10 w-10 animate-spin text-primary/50" />
                    <p>Loading geospatial intelligence...</p>
                </div>
            </Card>
        );
    }

    if (!isClient) {
        return (
            <Card className="h-[500px] flex items-center justify-center border-border/50 bg-card/50 backdrop-blur-sm">
                <p>Initializing Map...</p>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Global Audience Clusters
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {clusters.length} Active Regions
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 relative flex-1 min-h-[400px]">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%', minHeight: '400px', zIndex: 0 }}
                    className="bg-[#1a1a1a]"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {clusters.map((cluster) => {
                        // Extract coords from location string "lat, lng" or mock logic if just a name
                        // For this implementation, we'll try to parse or use a mock lookup
                        // We will check if the location field has coordinates, else randomize near a common point for demo
                        // Real implementation would parse proper lat/lng

                        // Mocking coords if not provided in "lat,lng" format
                        const mockCoords: [number, number] = [
                            Math.random() * 60 - 30 + 30, // Random lat
                            Math.random() * 100 - 50 // Random lng
                        ];

                        const parseCoords = (loc: string): [number, number] => {
                            if (loc.includes(',')) {
                                const [lat, lng] = loc.split(',').map(n => parseFloat(n.trim()));
                                if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
                            }
                            return mockCoords;
                        };

                        const position = parseCoords(cluster.location);

                        return (
                            <CircleMarker
                                key={cluster.id}
                                center={position}
                                pathOptions={{
                                    color: 'hsl(var(--primary))',
                                    fillColor: 'hsl(var(--primary))',
                                    fillOpacity: 0.6
                                }}
                                radius={Math.log(cluster.audience_size) * 2} // Scale radius by audience size
                            >
                                <Popup className="cluster-popup">
                                    <div className="p-2 space-y-1">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> {cluster.name}
                                        </h3>
                                        <div className="text-xs text-muted-foreground">{cluster.location}</div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                            <div className="bg-background/10 p-1 rounded">
                                                <div className="text-muted-foreground">Audience</div>
                                                <div className="font-bold">{cluster.audience_size.toLocaleString()}</div>
                                            </div>
                                            <div className="bg-background/10 p-1 rounded">
                                                <div className="text-muted-foreground">Engagement</div>
                                                <div className="font-bold">{(cluster.engagement_rate * 100).toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs border-t pt-1 border-gray-100/20">
                                            Dominant: <span className="text-primary">{cluster.dominant_topic}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>

                {/* Overlay Stats */}
                <div className="absolute bottom-4 left-4 z-[400] bg-background/80 backdrop-blur-md p-3 rounded-lg border border-border/50 shadow-lg max-w-[200px]">
                    <div className="text-xs uppercase text-muted-foreground font-semibold mb-2">Top Region</div>
                    {clusters.length > 0 && (
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary opacity-80" />
                            <div>
                                <div className="font-bold text-sm truncate">{clusters[0].name}</div>
                                <div className="text-xs text-primary">{clusters[0].dominant_topic}</div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default GeoTargeting;
