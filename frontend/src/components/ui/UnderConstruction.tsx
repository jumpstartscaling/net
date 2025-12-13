import React from 'react';
import { Construction } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UnderConstructionProps {
    title: string;
    description?: string;
    eta?: string;
}

const UnderConstruction = ({ title, description = "This module is currently being built.", eta = "Coming Soon" }: UnderConstructionProps) => {
    return (
        <Card className="border-dashed border-2 border-border/50 bg-card/20 backdrop-blur-sm h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 rounded-full bg-primary/10 mb-6 animate-pulse">
                <Construction className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                {description}
            </p>
            <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary">
                {eta}
            </Badge>
        </Card>
    );
};

export default UnderConstruction;
