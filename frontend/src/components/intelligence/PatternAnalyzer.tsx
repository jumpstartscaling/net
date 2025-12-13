import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import type { Pattern } from '@/lib/intelligence/types';
import { Brain, TrendingUp, Zap } from 'lucide-react';

interface PatternAnalyzerProps {
    patterns: Pattern[];
    isLoading?: boolean;
}

const PatternAnalyzer = ({ patterns, isLoading = false }: PatternAnalyzerProps) => {
    // Top patterns by confidence
    const topPatterns = [...patterns]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    const typeDistribution = patterns.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const radarData = Object.entries(typeDistribution).map(([key, value]) => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: value,
        fullMark: Math.max(...Object.values(typeDistribution)) * 1.2
    }));

    if (isLoading) {
        return (
            <Card className="h-[400px] flex items-center justify-center border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Brain className="h-10 w-10 animate-pulse text-primary/50" />
                    <p>Analyzing behavioral patterns...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confidence Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Pattern Confidence Scores
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topPatterns} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" domain={[0, 1]} hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    tick={{ fontSize: 12, fill: '#888' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '6px'
                                    }}
                                />
                                <Bar
                                    dataKey="confidence"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Type Distribution Radar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-warning" />
                        Pattern Type Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid opacity={0.2} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} hide />
                                <Radar
                                    name="Patterns"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.3}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '6px'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Discoveries List */}
            <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Discoveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {patterns.slice(0, 3).map((pattern) => (
                            <div key={pattern.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${pattern.type === 'structure' ? 'bg-blue-500/10 text-blue-500' :
                                            pattern.type === 'semantic' ? 'bg-purple-500/10 text-purple-500' :
                                                'bg-green-500/10 text-green-500'
                                        }`}>
                                        <Brain className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{pattern.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            {pattern.tags.map(tag => (
                                                <span key={tag}>#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{(pattern.confidence * 100).toFixed(0)}%</div>
                                        <div className="text-xs text-muted-foreground">Confidence</div>
                                    </div>
                                    <Badge variant="outline" className="bg-background/50">
                                        {pattern.occurrences} hits
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatternAnalyzer;
