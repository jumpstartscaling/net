
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const locations = [
    { id: 1, city: 'New York', lat: 40.7128, lng: -74.0060, value: 95 },
    { id: 2, city: 'Los Angeles', lat: 34.0522, lng: -118.2437, value: 88 },
    { id: 3, city: 'Chicago', lat: 41.8781, lng: -87.6298, value: 76 },
    { id: 4, city: 'Houston', lat: 29.7604, lng: -95.3698, value: 65 },
    { id: 5, city: 'Miami', lat: 25.7617, lng: -80.1918, value: 92 },
];

export const GeoMap = () => {
    return (
        <Card className="h-[600px] overflow-hidden border-border/50 relative z-0">
            <MapContainer
                center={[39.8283, -98.5795]}
                zoom={4}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {locations.map((loc) => (
                    <CircleMarker
                        key={loc.id}
                        center={[loc.lat, loc.lng]}
                        pathOptions={{
                            color: loc.value > 90 ? '#22c55e' : loc.value > 80 ? '#eab308' : '#3b82f6',
                            fillColor: loc.value > 90 ? '#22c55e' : loc.value > 80 ? '#eab308' : '#3b82f6',
                            fillOpacity: 0.5
                        }}
                        radius={Math.max(5, loc.value / 4)}
                    >
                        <Popup className="text-black">
                            <div className="font-bold">{loc.city}</div>
                            <div>Market Dominance: {loc.value}%</div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur p-4 rounded border border-border/50 z-[1000]">
                <h3 className="font-bold mb-2 text-xs uppercase tracking-wider">Dominance Key</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> &gt; 90% (Dominant)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> 80-90% (Strong)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> &lt; 80% (Growing)</div>
                </div>
            </div>
        </Card>
    );
};
