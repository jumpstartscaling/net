import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Site } from '@/types/schema';

export default function SiteList() {
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                // @ts-ignore
                const s = await client.request(readItems('sites'));
                setSites(s as Site[]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="text-slate-400">Loading sites...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
                <Card key={site.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group" onClick={() => window.location.href = `/admin/sites/${site.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            {site.name}
                        </CardTitle>
                        <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                            {site.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-2">{site.domain}</div>
                        <p className="text-xs text-slate-500">
                            {site.settings?.template || 'Default Template'}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" className="w-full">
                                Configure
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Empty State / Add New Placeholder */}
            {sites.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-400">No sites found.</p>
                </div>
            )}
        </div>
    );
}
