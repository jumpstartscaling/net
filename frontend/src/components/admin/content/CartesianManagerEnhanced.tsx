import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { DataTable } from '../shared/DataTable';
import { CRUDModal } from '../shared/CRUDModal';
import { DeleteConfirm } from '../shared/DeleteConfirm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Validation schema
const cartesianSchema = z.object({
    pattern_key: z.string().min(1, 'Pattern key is required'),
    pattern_type: z.string().min(1, 'Pattern type is required'),
    formula: z.string().min(1, 'Formula is required'),
    example_output: z.string().optional(),
    description: z.string().optional(),
});

type CartesianFormData = z.infer<typeof cartesianSchema>;

interface CartesianPattern {
    id: string;
    pattern_key: string;
    pattern_type: string;
    formula: string;
    example_output?: string;
    description?: string;
}

export default function CartesianManager() {
    const [patterns, setPatterns] = useState<CartesianPattern[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPattern, setEditingPattern] = useState<CartesianPattern | null>(null);
    const [deletingPattern, setDeletingPattern] = useState<CartesianPattern | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CartesianFormData>({
        resolver: zodResolver(cartesianSchema),
    });

    // Load data
    const loadPatterns = async () => {
        setIsLoading(true);
        try {
            const client = getDirectusClient();
            const data = await client.request(
                readItems('cartesian_patterns', {
                    fields: ['*'],
                    sort: ['pattern_type', 'pattern_key'],
                })
            );
            setPatterns(data as CartesianPattern[]);
        } catch (error) {
            console.error('Error loading cartesian patterns:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPatterns();
    }, []);

    // Handle create/edit
    const onSubmit = async (data: CartesianFormData) => {
        setIsSubmitting(true);
        try {
            const client = getDirectusClient();

            if (editingPattern) {
                await client.request(
                    updateItem('cartesian_patterns', editingPattern.id, data)
                );
            } else {
                await client.request(createItem('cartesian_patterns', data));
            }

            await loadPatterns();
            setIsModalOpen(false);
            reset();
            setEditingPattern(null);
        } catch (error) {
            console.error('Error saving pattern:', error);
            alert('Failed to save pattern');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingPattern) return;

        setIsSubmitting(true);
        try {
            const client = getDirectusClient();
            await client.request(deleteItem('cartesian_patterns', deletingPattern.id));
            await loadPatterns();
            setIsDeleteOpen(false);
            setDeletingPattern(null);
        } catch (error) {
            console.error('Error deleting pattern:', error);
            alert('Failed to delete pattern');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit click
    const handleEdit = (pattern: CartesianPattern) => {
        setEditingPattern(pattern);
        Object.keys(pattern).forEach((key) => {
            setValue(key as any, (pattern as any)[key]);
        });
        setIsModalOpen(true);
    };

    // Handle add click
    const handleAdd = () => {
        setEditingPattern(null);
        reset();
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (pattern: CartesianPattern) => {
        setDeletingPattern(pattern);
        setIsDeleteOpen(true);
    };

    // Export data
    const handleExport = () => {
        const dataStr = JSON.stringify(patterns, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cartesian-patterns-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    // Table columns
    const columns: ColumnDef<CartesianPattern>[] = [
        {
            accessorKey: 'pattern_key',
            header: 'Pattern Key',
            cell: ({ row }) => (
                <span className="font-medium text-white font-mono">{row.original.pattern_key}</span>
            ),
        },
        {
            accessorKey: 'pattern_type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge className="bg-purple-600">
                    {row.original.pattern_type}
                </Badge>
            ),
        },
        {
            accessorKey: 'formula',
            header: 'Formula',
            cell: ({ row }) => (
                <code className="text-xs text-green-400 bg-slate-900 px-2 py-1 rounded">
                    {row.original.formula.length > 50
                        ? row.original.formula.substring(0, 50) + '...'
                        : row.original.formula}
                </code>
            ),
        },
        {
            accessorKey: 'example_output',
            header: 'Example',
            cell: ({ row }) => (
                <span className="text-sm italic text-slate-400">
                    {row.original.example_output
                        ? (row.original.example_output.length > 40
                            ? row.original.example_output.substring(0, 40) + '...'
                            : row.original.example_output)
                        : '—'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(row.original)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const patternTypes = new Set(patterns.map(p => p.pattern_type));

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Patterns</div>
                    <div className="text-3xl font-bold text-white">{patterns.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Pattern Types</div>
                    <div className="text-3xl font-bold text-purple-400">{patternTypes.size}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Avg Formula Length</div>
                    <div className="text-3xl font-bold text-green-400">
                        {patterns.length > 0
                            ? Math.round(patterns.reduce((sum, p) => sum + p.formula.length, 0) / patterns.length)
                            : 0}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={patterns}
                columns={columns}
                onAdd={handleAdd}
                onExport={handleExport}
                searchPlaceholder="Search patterns..."
                addButtonText="Add Pattern"
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <CRUDModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPattern(null);
                    reset();
                }}
                title={editingPattern ? 'Edit Cartesian Pattern' : 'Create Cartesian Pattern'}
                description="Define content generation patterns using Cartesian product logic"
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
            >
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="pattern_key">Pattern Key</Label>
                            <Input
                                id="pattern_key"
                                {...register('pattern_key')}
                                placeholder="e.g., headline_template_1"
                                className="bg-slate-900 border-slate-700"
                            />
                            {errors.pattern_key && (
                                <p className="text-red-400 text-sm mt-1">{errors.pattern_key.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="pattern_type">Pattern Type</Label>
                            <Input
                                id="pattern_type"
                                {...register('pattern_type')}
                                placeholder="e.g., headline, intro, cta"
                                className="bg-slate-900 border-slate-700"
                            />
                            {errors.pattern_type && (
                                <p className="text-red-400 text-sm mt-1">{errors.pattern_type.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="formula">Formula</Label>
                        <Textarea
                            id="formula"
                            {...register('formula')}
                            placeholder="e.g., {adjective} {noun} in {location}"
                            className="bg-slate-900 border-slate-700 font-mono text-sm"
                            rows={3}
                        />
                        {errors.formula && (
                            <p className="text-red-400 text-sm mt-1">{errors.formula.message}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Use {'{'}curly braces{'}'} for variables that will be replaced
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="example_output">Example Output (Optional)</Label>
                        <Textarea
                            id="example_output"
                            {...register('example_output')}
                            placeholder="e.g., Amazing Services in Austin"
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            {...register('description')}
                            placeholder="e.g., Main headline template for service pages"
                            className="bg-slate-900 border-slate-700"
                        />
                    </div>
                </form>
            </CRUDModal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setDeletingPattern(null);
                }}
                onConfirm={handleDelete}
                itemName={deletingPattern?.pattern_key}
                isDeleting={isSubmitting}
            />
        </div>
    );
}
