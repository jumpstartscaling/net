import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ContentFactoryDashboard() {
    const [stats, setStats] = useState({ total: 0, ghost: 0, indexed: 0 });
    const [queues, setQueues] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const DIRECTUS_ADMIN_URL = "https://spark.jumpstartscaling.com/admin";

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            // Fetch Stats
            const statsRes = await fetch('/api/seo/stats');
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats({
                    total: statsData.total,
                    ghost: statsData.breakdown?.sitemap?.ghost || 0,
                    indexed: statsData.breakdown?.sitemap?.indexed || 0
                });
            } else {
                // Fallback if error (e.g. 500)
                setStats({ total: 0, ghost: 0, indexed: 0 });
            }

            // Fetch Campaigns
            const campaignsRes = await fetch('/api/admin/campaigns').then(r => r.json()).catch(() => ({ campaigns: [] }));
            setCampaigns(campaignsRes.campaigns || []);

            // Fetch Jobs / Queues
            const queuesRes = await fetch('/api/admin/queues').then(r => r.json()).catch(() => ({ queues: [] }));
            setQueues(queuesRes.queues || []);

            // Fetch Activity Log
            const logsRes = await fetch('/api/admin/worklog').then(r => r.json()).catch(() => ({ logs: [] }));
            // API might return { logs: [...] } or just array? Assuming { logs: ... } based on others
            // Converting logs to match UI expected format if necessary
            // logsRes structure depends on worklog.ts implementation.
            // Let's assume it returns { logs: [] }
            setLogs(logsRes.logs || []);

            setLoading(false);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            active: 'bg-green-600',
            paused: 'bg-yellow-600',
            completed: 'bg-blue-600',
            draft: 'bg-slate-600',
            Pending: 'bg-slate-600',
            Processing: 'bg-blue-600',
            Complete: 'bg-green-600',
            Failed: 'bg-red-600'
        };
        return <Badge className={`${colors[status] || 'bg-slate-600'} text-white`}>{status}</Badge>;
    };

    if (loading) return <div className="text-white p-8">Initializing Factory Command Center...</div>;

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Production Overview</h2>
                    <p className="text-slate-400">Monitoring Content Velocity & Integrity</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-slate-200 border-slate-700 hover:bg-slate-800" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}/content/posts`, '_blank')}>
                        Manage Articles (Backend)
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}`, '_blank')}>
                        Open Directus Admin ↗
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Ghost (Staged)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.ghost}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Indexed (Live)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.indexed}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{queues.filter(q => q.status === 'Processing').length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Campaigns */}
                <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white flex justify-between">
                            <span>Active Campaigns</span>
                            <Button variant="ghost" size="sm" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}/content/campaign_masters`, '_blank')}>View All</Button>
                        </CardTitle>
                        <CardDescription>Recent campaign activity and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400">Campaign Name</TableHead>
                                    <TableHead className="text-slate-400">Mode</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-right text-slate-400">Target</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length > 0 ? campaigns.map((campaign) => (
                                    <TableRow key={campaign.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                                        <TableCell className="text-slate-400">{campaign.location_mode || 'Standard'}</TableCell>
                                        <TableCell><StatusBadge status={campaign.status} /></TableCell>
                                        <TableCell className="text-right text-slate-400">{campaign.batch_count || 0}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colspan={4} className="text-center text-slate-500 py-8">No active campaigns</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Production Queue */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Production Jobs</CardTitle>
                        <CardDescription>Recent generation tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {queues.length > 0 ? queues.map((job) => (
                                <div key={job.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-medium text-white mb-1">Job #{job.id.substring(0, 8)}</div>
                                        <div className="text-xs text-slate-500">Target: {job.target_quantity} articles</div>
                                    </div>
                                    <StatusBadge status={job.status} />
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">Queue is empty</div>
                            )}
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                                + Start New Generation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Work Log / Activity */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">System Activity Log</CardTitle>
                    <CardDescription>Real-time backend operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-black rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto border border-slate-800">
                        {logs.length > 0 ? logs.map((log, i) => (
                            <div key={i} className="mb-2 border-b border-slate-900 pb-2 last:border-0">
                                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                <span className={log.action === 'create' ? 'text-green-400' : 'text-blue-400'}>{log.action.toUpperCase()}</span>{' '}
                                <span className="text-slate-300">{log.collection}</span>{' '}
                                <span className="text-slate-600">by {log.user?.email || 'System'}</span>
                            </div>
                        )) : (
                            <div className="text-slate-600 text-center mt-8">No recent activity</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
