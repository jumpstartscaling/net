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
const spintaxSchema = z.object({
    category: z.string().min(1, 'Category is required'),
    terms: z.string().min(1, 'At least one term is required'),
    description: z.string().optional(),
});

type SpintaxFormData = z.infer<typeof spintaxSchema>;

interface SpintaxDictionary {
    id: string;
    category: string;
    data: string[];
    description?: string;
}

export default function SpintaxManager() {
    const [dictionaries, setDictionaries] = useState<SpintaxDictionary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingDict, setEditingDict] = useState<SpintaxDictionary | null>(null);
    const [deletingDict, setDeletingDict] = useState<SpintaxDictionary | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<SpintaxFormData>({
        resolver: zodResolver(spintaxSchema),
    });

    // Load data
    const loadDictionaries = async () => {
        setIsLoading(true);
        try {
            const client = getDirectusClient();
            const data = await client.request(
                readItems('spintax_dictionaries', {
                    fields: ['*'],
                    sort: ['category'],
                })
            );
            setDictionaries(data as SpintaxDictionary[]);
        } catch (error) {
            console.error('Error loading spintax dictionaries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDictionaries();
    }, []);

    // Handle create/edit
    const onSubmit = async (formData: SpintaxFormData) => {
        setIsSubmitting(true);
        try {
            const client = getDirectusClient();

            // Convert comma-separated terms to array
            const termsArray = formData.terms
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const data = {
                category: formData.category,
                data: termsArray,
                description: formData.description,
            };

            if (editingDict) {
                await client.request(
                    updateItem('spintax_dictionaries', editingDict.id, data)
                );
            } else {
                await client.request(createItem('spintax_dictionaries', data));
            }

            await loadDictionaries();
            setIsModalOpen(false);
            reset();
            setEditingDict(null);
        } catch (error) {
            console.error('Error saving dictionary:', error);
            alert('Failed to save dictionary');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingDict) return;

        setIsSubmitting(true);
        try {
            const client = getDirectusClient();
            await client.request(deleteItem('spintax_dictionaries', deletingDict.id));
            await loadDictionaries();
            setIsDeleteOpen(false);
            setDeletingDict(null);
        } catch (error) {
            console.error('Error deleting dictionary:', error);
            alert('Failed to delete dictionary');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit click
    const handleEdit = (dict: SpintaxDictionary) => {
        setEditingDict(dict);
        setValue('category', dict.category);
        setValue('terms', (dict.data || []).join(', '));
        setValue('description', dict.description || '');
        setIsModalOpen(true);
    };

    // Handle add click
    const handleAdd = () => {
        setEditingDict(null);
        reset();
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (dict: SpintaxDictionary) => {
        setDeletingDict(dict);
        setIsDeleteOpen(true);
    };

    // Export data
    const handleExport = () => {
        const dataStr = JSON.stringify(dictionaries, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `spintax-dictionaries-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    // Table columns
    const columns: ColumnDef<SpintaxDictionary>[] = [
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => (
                <span className="font-medium text-white">{row.original.category}</span>
            ),
        },
        {
            accessorKey: 'data',
            header: 'Terms',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {(row.original.data || []).slice(0, 5).map((term, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                            {term}
                        </Badge>
                    ))}
                    {(row.original.data || []).length > 5 && (
                        <Badge variant="outline" className="text-xs text-slate-500">
                            +{(row.original.data || []).length - 5} more
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'count',
            header: 'Count',
            cell: ({ row }) => (
                <Badge className="bg-blue-600">
                    {(row.original.data || []).length}
                </Badge>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => row.original.description || '—',
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

    const totalTerms = dictionaries.reduce((sum, d) => sum + (d.data || []).length, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Dictionaries</div>
                    <div className="text-3xl font-bold text-white">{dictionaries.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Terms</div>
                    <div className="text-3xl font-bold text-blue-400">{totalTerms}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Avg Terms/Dict</div>
                    <div className="text-3xl font-bold text-green-400">
                        {dictionaries.length > 0 ? Math.round(totalTerms / dictionaries.length) : 0}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={dictionaries}
                columns={columns}
                onAdd={handleAdd}
                onExport={handleExport}
                searchPlaceholder="Search dictionaries..."
                addButtonText="Add Dictionary"
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <CRUDModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDict(null);
                    reset();
                }}
                title={editingDict ? 'Edit Spintax Dictionary' : 'Create Spintax Dictionary'}
                description="Manage synonym variations for content generation"
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
            >
                <form className="space-y-4">
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            {...register('category')}
                            placeholder="e.g., adjectives, verbs, locations"
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.category && (
                            <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="terms">Terms (comma-separated)</Label>
                        <Textarea
                            id="terms"
                            {...register('terms')}
                            placeholder="e.g., great, excellent, amazing, fantastic"
                            className="bg-slate-900 border-slate-700"
                            rows={4}
                        />
                        {errors.terms && (
                            <p className="text-red-400 text-sm mt-1">{errors.terms.message}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Separate terms with commas. Each term will be a variation.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            {...register('description')}
                            placeholder="e.g., Positive adjectives for product descriptions"
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
                    setDeletingDict(null);
                }}
                onConfirm={handleDelete}
                itemName={deletingDict?.category}
                isDeleting={isSubmitting}
            />
        </div>
    );
}
