import { atom, map } from 'nanostores';

export type LogType = 'log' | 'warn' | 'error' | 'info';

export interface LogEntry {
    id: string;
    timestamp: string;
    type: LogType;
    messages: any[];
}

export const debugIsOpen = atom(false);
export const activeTab = atom<'console' | 'network' | 'backend'>('console');
export const logs = atom<LogEntry[]>([]);

// Initialize log capturer
if (typeof window !== 'undefined') {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (type: LogType, args: any[]) => {
        const entry: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString().split('T')[1].slice(0, 8), // HH:MM:SS
            type,
            messages: args.map(arg => {
                try {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch (e) {
                    return '[Circular/Unserializable]';
                }
            })
        };

        const currentLogs = logs.get();
        // Keep last 100 logs
        const newLogs = [...currentLogs, entry].slice(-100);
        logs.set(newLogs);
    };

    console.log = (...args) => {
        originalLog(...args);
        addLog('log', args);
    };

    console.warn = (...args) => {
        originalWarn(...args);
        addLog('warn', args);
    };

    console.error = (...args) => {
        originalError(...args);
        addLog('error', args);
    };

    console.info = (...args) => {
        originalInfo(...args);
        addLog('info', args);
    };
}
