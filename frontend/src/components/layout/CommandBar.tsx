/**
 * Command Palette (Cmd+K)
 * Global search and quick actions
 */

'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';

export default function CommandBar() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle on Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <Command.Dialog open={open} onOpenChange={setOpen} label="Command Menu">
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
                <Command className="rounded-lg border border-slate-700 bg-slate-800 shadow-2xl">
                    <Command.Input
                        placeholder="Search or jump to..."
                        className="w-full border-b border-slate-700 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    <Command.List className="max-h-96 overflow-y-auto p-2">
                        <Command.Empty className="px-4 py-8 text-center text-slate-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigate" className="text-slate-400 text-xs uppercase px-2 py-1.5">
                            <CommandItem onSelect={() => router.push('/admin')}>
                                🏠 Dashboard
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/factory')}>
                                🏭 Factory Floor
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/intelligence/avatars')}>
                                👥 Avatar Bay
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/intelligence/geo')}>
                                🗺️ Geo Chamber
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/intelligence/patterns')}>
                                🔧 Pattern Forge
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/sites')}>
                                🌐 Sites
                            </CommandItem>
                        </Command.Group>

                        <Command.Group heading="Quick Actions" className="text-slate-400 text-xs uppercase px-2 py-1.5 mt-2">
                            <CommandItem onSelect={() => router.push('/admin/factory?action=new')}>
                                ✨ New Campaign
                            </CommandItem>
                            <CommandItem onSelect={() => router.push('/admin/sites/new')}>
                                ➕ Add Site
                            </CommandItem>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </Command.Dialog>
    );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors"
        >
            {children}
        </Command.Item>
    );
}
