import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Star, Trophy } from 'lucide-react';
import type { AvatarMetric } from '@/lib/intelligence/types';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table"; // Assuming table exists, if not I will fallback to divs. Based on list_dir earlier, table.tsx exists.

interface AvatarMetricsProps {
    metrics: AvatarMetric[];
    isLoading?: boolean;
}

const AvatarMetrics = ({ metrics, isLoading = false }: AvatarMetricsProps) => {
    // Sort by engagement
    const sortedMetrics = [...metrics].sort((a, b) => b.avg_engagement - a.avg_engagement);
    const topPerformer = sortedMetrics[0];

    if (isLoading) {
        return (
            <Card className="h-[400px] flex items-center justify-center border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Users className="h-10 w-10 animate-pulse text-primary/50" />
                    <p>Analyzing avatar performance...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-purple-500" />
                    Avatar Performance
                </CardTitle>
                {topPerformer && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1">
                        <Trophy className="h-3 w-3" />
                        Top: {topPerformer.name}
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-border/50">
                    <Table>
                        <TableHeader className="bg-background/50">
                            <TableRow>
                                <TableHead>Avatar Name</TableHead>
                                <TableHead>Top Niche</TableHead>
                                <TableHead className="text-right">Articles</TableHead>
                                <TableHead className="text-right">Engagement</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedMetrics.map((avatar) => (
                                <TableRow key={avatar.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold">
                                                {avatar.name.charAt(0)}
                                            </div>
                                            {avatar.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {avatar.top_niche}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            {avatar.articles_generated}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 font-bold">
                                            {avatar.avg_engagement > 0.8 && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                                            {(avatar.avg_engagement * 100).toFixed(1)}%
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AvatarMetrics;
