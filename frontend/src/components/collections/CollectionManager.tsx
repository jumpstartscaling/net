/**
 * Universal Collection Manager
 * Reusable component for all collection pages
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CollectionManagerProps {
    collection: string;
    title: string;
    description: string;
    icon: string;
    displayField: string;
}

export default function CollectionManager({
    collection,
    title,
    description,
    icon,
    displayField,
}: CollectionManagerProps) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, [collection]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://spark.jumpstartscaling.com/items/${collection}?limit=100`,
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.PUBLIC_DIRECTUS_TOKEN}`,
                    },
                }
            );

            if (!response.ok) throw new Error(`Failed to fetch ${collection}`);

            const data = await response.json();
            setItems(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExport = () => {
        const jsonStr = JSON.stringify(items, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collection}_export.json`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spark-data animate-pulse">Loading {title}...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="spark-card p-6 border-red-500">
                <div className="text-red-400">Error: {error}</div>
                <button onClick={fetchItems} className="spark-btn-secondary text-sm mt-4">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="spark-heading text-3xl flex items-center gap-3">
                        <span>{icon}</span>
                        {title}
                    </h1>
                    <p className="text-silver mt-1">{description}</p>
                </div>
                <div className="flex gap-3">
                    <button className="spark-btn-secondary text-sm" onClick={handleBulkExport}>
                        📤 Export
                    </button>
                    <button className="spark-btn-secondary text-sm">
                        📥 Import
                    </button>
                    <button className="spark-btn-primary text-sm">
                        ✨ New {title.slice(0, -1)}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="spark-card p-6">
                    <div className="spark-label mb-2">Total Items</div>
                    <div className="spark-data text-3xl">{items.length}</div>
                </div>
                <div className="spark-card p-6">
                    <div className="spark-label mb-2">This Week</div>
                    <div className="spark-data text-3xl">0</div>
                </div>
                <div className="spark-card p-6">
                    <div className="spark-label mb-2">Usage Count</div>
                    <div className="spark-data text-3xl">—</div>
                </div>
                <div className="spark-card p-6">
                    <div className="spark-label mb-2">Status</div>
                    <div className="text-green-400 text-sm">●  Active</div>
                </div>
            </div>

            {/* Table */}
            <div className="spark-card overflow-hidden">
                <table className="spark-table">
                    <thead>
                        <tr>
                            <th className="w-12">
                                <input type="checkbox" className="w-4 h-4" />
                            </th>
                            <th>ID</th>
                            <th>{displayField}</th>
                            <th>Created</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <input type="checkbox" className="w-4 h-4" />
                                </td>
                                <td className="spark-data text-sm">{item.id}</td>
                                <td className="text-white font-medium">
                                    {item[displayField] || 'Untitled'}
                                </td>
                                <td className="text-silver text-sm">
                                    {item.date_created
                                        ? new Date(item.date_created).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="spark-btn-ghost text-xs px-2 py-1">
                                                Actions
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                            {/* Preview Action for Posts/Pages */}
                                            {['posts', 'pages', 'generated_articles'].includes(collection) && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        // Fallback site ID since directus schema might vary on how it stores site ref
                                                        const siteId = (item as any).site || (item as any).site_id || 'default';
                                                        const url = `https://launch.jumpstartscaling.com/site/${siteId}/preview/${item.id}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" /> Preview
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {items.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-silver/50">No items found. Create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
