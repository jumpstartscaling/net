
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { WordPressClient } from '@/lib/wordpress/WordPressClient';
import { getDirectusClient, createItem } from '@/lib/directus/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Step = 'connect' | 'inventory' | 'qc' | 'launch';

export default function JumpstartWizard() {
    const [step, setStep] = useState<Step>('connect');
    const [logs, setLogs] = useState<string[]>([]);

    // Connection State
    const [siteUrl, setSiteUrl] = useState('');
    const [username, setUsername] = useState('');
    const [appPassword, setAppPassword] = useState('');

    // Inventory State
    const [inventory, setInventory] = useState<any>(null);
    const [qcItems, setQcItems] = useState<any[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // 1. CONNECT THE CABLES
    const handleConnect = async () => {
        addLog(`🔌 Connecting to ${siteUrl}...`);
        try {
            const wp = new WordPressClient(siteUrl, appPassword ? `${username}:${appPassword}` : undefined);
            const alive = await wp.testConnection();
            if (alive) {
                addLog("✅ Connection Successful.");
                setStep('inventory');
                await scanInventory(wp);
            } else {
                addLog("❌ Connection Failed. Check URL.");
            }
        } catch (e) { addLog(`❌ Error: ${e.message}`); }
    };

    // 2. INVENTORY & FILTER
    const scanInventory = async (wp: WordPressClient) => {
        addLog("📦 Fetching Inventory (Posts, Pages, Taxonomies)...");
        // Mocking inventory scan for UI dev
        // In real impl, we fetch categories/tags and filter < 10
        setTimeout(() => {
            addLog("🔎 Filtering Taxonomies (<10 ignored)...");
            addLog("📊 Found 124 Post, 12 Good Categories.");
            setInventory({ total_posts: 124, valid_categories: 12 });
            setStep('qc');
            generateQC(wp);
        }, 1500);
    };

    // 3. QC GENERATION (First 3)
    const generateQC = async (wp: WordPressClient) => {
        addLog("🧪 Generating QC Batch (First 3 Articles)...");
        // Trigger API with limit=3
        setTimeout(() => {
            setQcItems([
                { id: 1, title: 'AI Refactored: Post One', status: 'Review Needed' },
                { id: 2, title: 'AI Refactored: Post Two', status: 'Review Needed' },
                { id: 3, title: 'AI Refactored: Post Three', status: 'Review Needed' }
            ]);
            addLog("⚠️ QC Paused. Waiting for Approval.");
        }, 2000);
    };

    // 4. IGNITION
    const handleLaunch = () => {
        setStep('launch');
        addLog("🚀 IGNITION! Starting Mass Generation & Deployment...");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Animation */}
            <div className="flex items-center justify-between bg-slate-900 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                <div className="z-10 relative">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Guided Jumpstart Test</h1>
                    <p className="text-slate-400">Phase 6: Connection, Inventory, QC, Ignition.</p>
                </div>
                <img
                    src="/assets/rocket_man.webp"
                    className={`w-32 h-32 object-contain transition-transform duration-1000 ${step === 'launch' ? 'translate-x-[200px] -translate-y-[100px] opacity-0' : ''}`}
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Control Panel */}
                <Card className="col-span-2 bg-slate-800 border-slate-700">
                    <CardContent className="p-6 space-y-6">
                        {step === 'connect' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">1. Connect the Cables</h2>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Site URL</label>
                                    <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="bg-slate-900 border-slate-600" placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Username</label>
                                        <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-900 border-slate-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">App Password</label>
                                        <Input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} className="bg-slate-900 border-slate-600" />
                                    </div>
                                </div>
                                <Button onClick={handleConnect} className="w-full bg-blue-600 hover:bg-blue-500">Connect & Scan</Button>
                            </div>
                        )}

                        {step === 'qc' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">2. Quality Control Gate</h2>
                                <div className="bg-slate-900 p-4 rounded-lg space-y-2">
                                    {qcItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                            <span className="text-slate-200 font-medium">{item.title}</span>
                                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">Review Needed</Badge>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">Reject / Regenerate</Button>
                                    <Button onClick={handleLaunch} className="flex-1 bg-green-600 hover:bg-green-500">Approve & Ignite 🚀</Button>
                                </div>
                            </div>
                        )}

                        {step === 'launch' && (
                            <div className="space-y-4 text-center py-8">
                                <h2 className="text-2xl font-bold text-green-400 animate-pulse">Engine Running</h2>
                                <p className="text-slate-400">Deployment in progress. Do not close this window.</p>
                                <Progress value={45} className="h-4 bg-slate-900" />
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-white">124</div>
                                        <div className="text-xs text-slate-500">Total</div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-blue-400">45</div>
                                        <div className="text-xs text-slate-500">Processed</div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-green-400">42</div>
                                        <div className="text-xs text-slate-500">Deployed</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Live Logs */}
                <Card className="bg-slate-900 border-slate-800 shadow-inner h-[500px] overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-800 bg-slate-950">
                        <h3 className="text-xs font-mono text-green-500 uppercase">System Logs</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2">
                                {log}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
