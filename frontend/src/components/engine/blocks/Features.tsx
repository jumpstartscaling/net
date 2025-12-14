import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface FeatureItem {
    title: string;
    desc: string;
    icon?: string;
}

interface FeaturesProps {
    items: FeatureItem[];
    layout?: 'grid' | 'list';
}

export default function Features({ items, layout = 'grid' }: FeaturesProps) {
    return (
        <section className="py-16 px-8 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto">
                <div className={`grid gap-8 ${layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {items?.map((item, i) => (
                        <Card key={i} className="border-0 shadow-lg bg-white dark:bg-zinc-900 dark:border-zinc-800">
                            <CardHeader className="pb-2">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
