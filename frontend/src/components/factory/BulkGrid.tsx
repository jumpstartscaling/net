/**
 * Bulk Grid Component
 * High-performance table view with TanStack Table
 */

'use client';

import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Article {
    id: string;
    title: string;
    status: string;
    seo_score?: number;
    geo_city?: string;
    geo_state?: string;
    date_created?: string;
}

interface BulkGridProps {
    articles: Article[];
    onBulkAction: (action: string, articleIds: string[]) => void;
}

export default function BulkGrid({ articles, onBulkAction }: BulkGridProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo<ColumnDef<Article>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="w-4 h-4 rounded border-edge-subtle bg-graphite"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="w-4 h-4 rounded border-edge-subtle bg-graphite"
                    />
                ),
            },
            {
                accessorKey: 'title',
                header: 'Title',
                cell: (info) => (
                    <div className="text-white font-medium">{info.getValue() as string}</div>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue() as string;
                    const statusColors = {
                        queued: 'border-slate-500 text-slate-400',
                        generating: 'border-electric-400 text-electric-400',
                        review: 'border-yellow-500 text-yellow-400',
                        approved: 'border-green-500 text-green-400',
                        published: 'border-edge-gold text-gold-300',
                    };
                    return (
                        <span className={`spark-status ${statusColors[status as keyof typeof statusColors]}`}>
                            {status}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'geo_city',
                header: 'Location',
                cell: (info) => {
                    const city = info.getValue() as string;
                    const state = info.row.original.geo_state;
                    return city ? (
                        <span className="text-silver">
                            {city}{state ? `, ${state}` : ''}
                        </span>
                    ) : <span className="text-silver/50">—</span>;
                },
            },
            {
                accessorKey: 'seo_score',
                header: 'SEO',
                cell: (info) => {
                    const score = info.getValue() as number;
                    return score ? (
                        <span className="spark-data">{score}/100</span>
                    ) : <span className="text-silver/50">—</span>;
                },
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button className="spark-btn-ghost text-xs px-2 py-1">
                            Edit
                        </button>
                        <button className="spark-btn-ghost text-xs px-2 py-1">
                            Preview
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: articles,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedCount > 0 && (
                <div className="spark-card p-4 flex items-center justify-between">
                    <span className="spark-data">{selectedCount} selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onBulkAction('approve', Object.keys(rowSelection))}
                            className="spark-btn-secondary text-sm"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onBulkAction('publish', Object.keys(rowSelection))}
                            className="spark-btn-primary text-sm"
                        >
                            Publish
                        </button>
                        <button
                            onClick={() => onBulkAction('delete', Object.keys(rowSelection))}
                            className="spark-btn-ghost text-red-400 text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="spark-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="spark-table">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="text-left p-4">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none flex items-center gap-2'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="p-4 border-b border-edge-subtle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
