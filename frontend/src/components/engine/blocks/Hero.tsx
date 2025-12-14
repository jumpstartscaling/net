import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroProps {
    title: string;
    subtitle?: string;
    bg?: string;
    ctaLabel?: string;
    ctaUrl?: string;
}

export default function Hero({ title, subtitle, bg, ctaLabel, ctaUrl }: HeroProps) {
    const bgClass = bg === 'dark' ? 'bg-zinc-900 text-white' :
        bg === 'image' ? 'bg-zinc-800 text-white' : // Placeholder for image logic
            'bg-white text-zinc-900';

    return (
        <section className={`py-20 px-8 text-center ${bgClass}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl md:text-2xl opacity-80 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                )}
                {(ctaLabel && ctaUrl) && (
                    <div className="pt-4">
                        <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full">
                            <a href={ctaUrl}>{ctaLabel}</a>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
