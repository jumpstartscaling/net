import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GeoLocation {
    id: string;
    city: string;
    state: string;
    zip_focus?: string;
    neighborhood?: string;
    cluster: number;
}

interface GeoCluster {
    id: number;
    cluster_name: string;
    locations?: GeoLocation[];
}

export default function GeoIntelligenceManager() {
    const [clusters, setClusters] = useState<GeoCluster[]>([]);
    const [locations, setLocations] = useState<GeoLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const client = getDirectusClient();

            // Load clusters
            const clustersData = await client.request(
                readItems('geo_clusters', {
                    fields: ['*'],
                    sort: ['cluster_name'],
                })
            );

            // Load locations
            const locationsData = await client.request(
                readItems('geo_locations', {
                    fields: ['*'],
                    sort: ['state', 'city'],
                })
            );

            setClusters(clustersData as GeoCluster[]);
            setLocations(locationsData as GeoLocation[]);
        } catch (error) {
            console.error('Error loading geo intelligence:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Group locations by cluster
    const locationsByCluster = locations.reduce((acc, loc) => {
        if (!acc[loc.cluster]) acc[loc.cluster] = [];
        acc[loc.cluster].push(loc);
        return acc;
    }, {} as Record<number, GeoLocation[]>);

    const totalCities = locations.length;
    const totalStates = new Set(locations.map(l => l.state)).size;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Clusters</div>
                    <div className="text-3xl font-bold text-white">{clusters.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Cities</div>
                    <div className="text-3xl font-bold text-blue-400">{totalCities}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">States Covered</div>
                    <div className="text-3xl font-bold text-green-400">{totalStates}</div>
                </div>
            </div>

            {/* Clusters */}
            <div className="space-y-4">
                {clusters.map((cluster) => {
                    const clusterLocations = locationsByCluster[cluster.id] || [];

                    return (
                        <Card key={cluster.id} className="bg-slate-800 border-slate-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white flex justify-between items-center">
                                    <span className="flex items-center gap-3">
                                        🗺️ {cluster.cluster_name}
                                    </span>
                                    <Badge className="bg-blue-600">
                                        {clusterLocations.length} Cities
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {clusterLocations.map((loc) => (
                                        <div
                                            key={loc.id}
                                            className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                                        >
                                            <div className="font-medium text-white mb-1">
                                                {loc.city}, {loc.state}
                                            </div>
                                            {loc.neighborhood && (
                                                <div className="text-xs text-slate-400 mb-1">
                                                    📍 {loc.neighborhood}
                                                </div>
                                            )}
                                            {loc.zip_focus && (
                                                <div className="text-xs text-slate-500">
                                                    ZIP: {loc.zip_focus}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {clusters.length === 0 && (
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <p className="text-slate-400 mb-4">No geographic clusters found.</p>
                        <p className="text-sm text-slate-500">
                            Run the schema initialization script to import geo intelligence data.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
