import { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';

interface SystemStatus {
    coreApi: 'online' | 'offline' | 'checking';
    database: 'connected' | 'disconnected' | 'checking';
    wpConnection: 'ready' | 'error' | 'checking';
}

interface LogEntry {
    time: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export default function SystemStatusBar() {
    const [status, setStatus] = useState<SystemStatus>({
        coreApi: 'checking',
        database: 'checking',
        wpConnection: 'checking'
    });

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        checkSystemStatus();
        const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const checkSystemStatus = async () => {
        try {
            const client = getDirectusClient();

            // Test database connection by fetching a single site
            const sites = await client.request(
                readItems('sites', { limit: 1 })
            );

            setStatus({
                coreApi: 'online',
                database: 'connected',
                wpConnection: 'ready'
            });

            addLog('System check passed', 'success');
        } catch (error) {
            console.error('Status check failed:', error);
            setStatus({
                coreApi: 'offline',
                database: 'disconnected',
                wpConnection: 'error'
            });
            addLog(`System check failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    const addLog = (message: string, type: LogEntry['type']) => {
        const newLog: LogEntry = {
            time: new Date().toLocaleTimeString(),
            message,
            type
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'online':
            case 'connected':
            case 'ready':
                return 'text-green-400';
            case 'offline':
            case 'disconnected':
            case 'error':
                return 'text-red-400';
            case 'checking':
                return 'text-yellow-400';
            default:
                return 'text-slate-400';
        }
    };

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'success':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            default:
                return 'text-slate-400';
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 shadow-lg">
            {/* Main Status Bar */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white whitespace-nowrap">
                        API & Logistics
                    </h3>

                    {/* Status Items */}
                    <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">Core API</span>
                            <span className={getStatusColor(status.coreApi)}>
                                {status.coreApi.charAt(0).toUpperCase() + status.coreApi.slice(1)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">Database (Directus</span>
                            <span className={getStatusColor(status.database)}>
                                {status.database.charAt(0).toUpperCase() + status.database.slice(1)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">WP Connection</span>
                            <span className={getStatusColor(status.wpConnection)}>
                                {status.wpConnection.charAt(0).toUpperCase() + status.wpConnection.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Toggle Logs Button */}
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 transition-colors whitespace-nowrap"
                    >
                        {showLogs ? 'Hide' : 'Show'} Processing Log
                    </button>
                </div>
            </div>

            {/* Processing Log Panel */}
            {showLogs && (
                <div className="border-t border-slate-700 bg-slate-900">
                    <div className="container mx-auto px-4 py-3 max-h-48 overflow-y-auto">
                        <div className="space-y-1">
                            {logs.length === 0 ? (
                                <div className="text-sm text-slate-500 italic">No recent activity</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm font-mono">
                                        <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                        <span className={getLogColor(log.type)}>{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
