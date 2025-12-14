import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { debugIsOpen, activeTab, logs, type LogEntry } from '../../stores/debugStore';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDirectusClient } from '@/lib/directus/client';

// Create a client for the devtools if one doesn't exist in context
// (Ideally this component is inside the main QueryClientProvider, but we'll see)
const queryClient = new QueryClient();

export default function DebugToolbar() {
    const isOpen = useStore(debugIsOpen);
    const currentTab = useStore(activeTab);
    const logEntries = useStore(logs);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'error'>('checking');
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && currentTab === 'backend') {
            checkBackend();
        }
    }, [isOpen, currentTab]);

    const checkBackend = async () => {
        setBackendStatus('checking');
        const start = performance.now();
        try {
            const client = getDirectusClient();
            await client.request(() => ({
                path: '/server/ping',
                method: 'GET'
            }));
            setLatency(Math.round(performance.now() - start));
            setBackendStatus('online');
        } catch (e) {
            setBackendStatus('error');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => debugIsOpen.set(true)}
                className="fixed bottom-4 right-4 z-[9999] p-3 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-transform border border-gray-700"
                title="Open Debug Toolbar"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[33vh] z-[9999] bg-black/95 text-white border-t border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex flex-col font-mono text-sm backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-yellow-500">⚡ Spark Debug</span>
                    <div className="flex gap-1 bg-gray-800 rounded p-1">
                        {(['console', 'backend', 'network'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => activeTab.set(tab)}
                                className={`px-3 py-1 rounded text-xs uppercase font-medium transition-colors ${currentTab === tab
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => debugIsOpen.set(false)}
                    className="p-1 hover:bg-gray-800 rounded"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">

                {/* Console Tab */}
                {currentTab === 'console' && (
                    <div className="h-full overflow-y-auto p-4 space-y-1">
                        {logEntries.length === 0 && (
                            <div className="text-gray-500 text-center mt-10">No logs captured yet...</div>
                        )}
                        {logEntries.map((log) => (
                            <div key={log.id} className="flex gap-2 font-mono text-xs border-b border-gray-800/50 pb-1">
                                <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                                <span className={`shrink-0 w-12 font-bold uppercase ${log.type === 'error' ? 'text-red-500' :
                                        log.type === 'warn' ? 'text-yellow-500' :
                                            'text-blue-400'
                                    }`}>
                                    {log.type}
                                </span>
                                <span className="text-gray-300 break-all">
                                    {log.messages.join(' ')}
                                </span>
                            </div>
                        ))}
                        <div className="absolute bottom-4 right-4">
                            <button
                                onClick={() => logs.set([])}
                                className="px-2 py-1 bg-gray-800 text-xs rounded hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Backend Tab */}
                {currentTab === 'backend' && (
                    <div className="h-full p-6 flex flex-col items-center justify-center gap-4">
                        <div className={`text-4xl ${backendStatus === 'online' ? 'text-green-500' :
                                backendStatus === 'error' ? 'text-red-500' :
                                    'text-yellow-500 animate-pulse'
                            }`}>
                            {backendStatus === 'online' ? '● Online' :
                                backendStatus === 'error' ? '✖ Error' : '● Checking...'}
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-gray-400">
                                Directus URL: <span className="text-white">{import.meta.env.PUBLIC_DIRECTUS_URL}</span>
                            </p>
                            {latency && (
                                <p className="text-gray-400">
                                    Latency: <span className="text-white">{latency}ms</span>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={checkBackend}
                            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition"
                        >
                            Re-check Connection
                        </button>
                    </div>
                )}

                {/* Network / React Query Tab */}
                {currentTab === 'network' && (
                    <div className="h-full w-full relative bg-gray-900">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            {/* 
                  React Query Devtools needs a QueryClientProvider context.
                  In Astro, components are islands. If this island doesn't share context with the main app 
                  (which it likely won't if they are separate roots), we might see empty devtools.
                  However, putting it here is the best attempt.
                */}
                            <div className="text-center">
                                <p className="mb-2">React Query Devtools</p>
                                <p className="text-xs">
                                    (If empty, data fetching might be happening Server-Side or in a different Context)
                                </p>
                            </div>
                        </div>
                        {/* We force mount devtools panel here if possible */}
                        <QueryClientProvider client={queryClient}>
                            <ReactQueryDevtools initialIsOpen={true} panelPosition="relative" />
                        </QueryClientProvider>
                    </div>
                )}

            </div>
        </div>
    );
}
