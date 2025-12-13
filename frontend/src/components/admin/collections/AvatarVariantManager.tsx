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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Validation schema
const avatarVariantSchema = z.object({
    avatar_key: z.string().min(1, 'Avatar key is required'),
    variant_type: z.enum(['male', 'female', 'neutral']),
    pronoun: z.string().min(1, 'Pronoun is required'),
    identity: z.string().min(1, 'Identity is required'),
    tone_modifiers: z.string().optional(),
});

type AvatarVariantFormData = z.infer<typeof avatarVariantSchema>;

interface AvatarVariant {
    id: string;
    avatar_key: string;
    variant_type: 'male' | 'female' | 'neutral';
    pronoun: string;
    identity: string;
    tone_modifiers?: string;
}

export default function AvatarVariantManager() {
    const [variants, setVariants] = useState<AvatarVariant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<AvatarVariant | null>(null);
    const [deletingVariant, setDeletingVariant] = useState<AvatarVariant | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AvatarVariantFormData>({
        resolver: zodResolver(avatarVariantSchema),
    });

    const variantType = watch('variant_type');

    // Load data
    const loadVariants = async () => {
        setIsLoading(true);
        try {
            const client = getDirectusClient();
            const data = await client.request(
                readItems('avatar_variants', {
                    fields: ['*'],
                    sort: ['avatar_key', 'variant_type'],
                })
            );
            setVariants(data as AvatarVariant[]);
        } catch (error) {
            console.error('Error loading avatar variants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVariants();
    }, []);

    // Handle create/edit
    const onSubmit = async (data: AvatarVariantFormData) => {
        setIsSubmitting(true);
        try {
            const client = getDirectusClient();

            if (editingVariant) {
                await client.request(
                    updateItem('avatar_variants', editingVariant.id, data)
                );
            } else {
                await client.request(createItem('avatar_variants', data));
            }

            await loadVariants();
            setIsModalOpen(false);
            reset();
            setEditingVariant(null);
        } catch (error) {
            console.error('Error saving variant:', error);
            alert('Failed to save variant');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingVariant) return;

        setIsSubmitting(true);
        try {
            const client = getDirectusClient();
            await client.request(deleteItem('avatar_variants', deletingVariant.id));
            await loadVariants();
            setIsDeleteOpen(false);
            setDeletingVariant(null);
        } catch (error) {
            console.error('Error deleting variant:', error);
            alert('Failed to delete variant');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit click
    const handleEdit = (variant: AvatarVariant) => {
        setEditingVariant(variant);
        setValue('avatar_key', variant.avatar_key);
        setValue('variant_type', variant.variant_type);
        setValue('pronoun', variant.pronoun);
        setValue('identity', variant.identity);
        setValue('tone_modifiers', variant.tone_modifiers || '');
        setIsModalOpen(true);
    };

    // Handle add click
    const handleAdd = () => {
        setEditingVariant(null);
        reset();
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (variant: AvatarVariant) => {
        setDeletingVariant(variant);
        setIsDeleteOpen(true);
    };

    // Export data
    const handleExport = () => {
        const dataStr = JSON.stringify(variants, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `avatar-variants-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    // Table columns
    const columns: ColumnDef<AvatarVariant>[] = [
        {
            accessorKey: 'avatar_key',
            header: 'Avatar',
            cell: ({ row }) => (
                <span className="font-medium text-white">{row.original.avatar_key}</span>
            ),
        },
        {
            accessorKey: 'variant_type',
            header: 'Type',
            cell: ({ row }) => {
                const type = row.original.variant_type;
                const colors = {
                    male: 'bg-blue-500/20 text-blue-400',
                    female: 'bg-pink-500/20 text-pink-400',
                    neutral: 'bg-purple-500/20 text-purple-400',
                };
                return (
                    <Badge className={colors[type]}>
                        {type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'pronoun',
            header: 'Pronoun',
        },
        {
            accessorKey: 'identity',
            header: 'Identity',
        },
        {
            accessorKey: 'tone_modifiers',
            header: 'Tone Modifiers',
            cell: ({ row }) => row.original.tone_modifiers || '—',
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

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Variants</div>
                    <div className="text-3xl font-bold text-white">{variants.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Male</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {variants.filter((v) => v.variant_type === 'male').length}
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Female</div>
                    <div className="text-3xl font-bold text-pink-400">
                        {variants.filter((v) => v.variant_type === 'female').length}
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Neutral</div>
                    <div className="text-3xl font-bold text-purple-400">
                        {variants.filter((v) => v.variant_type === 'neutral').length}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={variants}
                columns={columns}
                onAdd={handleAdd}
                onExport={handleExport}
                searchPlaceholder="Search variants..."
                addButtonText="Add Variant"
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <CRUDModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingVariant(null);
                    reset();
                }}
                title={editingVariant ? 'Edit Avatar Variant' : 'Create Avatar Variant'}
                description="Configure gender and tone variations for an avatar"
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
            >
                <form className="space-y-4">
                    <div>
                        <Label htmlFor="avatar_key">Avatar Key</Label>
                        <Input
                            id="avatar_key"
                            {...register('avatar_key')}
                            placeholder="e.g., dr_smith"
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.avatar_key && (
                            <p className="text-red-400 text-sm mt-1">{errors.avatar_key.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="variant_type">Variant Type</Label>
                        <Select
                            value={variantType}
                            onValueChange={(value) => setValue('variant_type', value as any)}
                        >
                            <SelectTrigger className="bg-slate-900 border-slate-700">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="neutral">Neutral</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.variant_type && (
                            <p className="text-red-400 text-sm mt-1">{errors.variant_type.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="pronoun">Pronoun</Label>
                        <Input
                            id="pronoun"
                            {...register('pronoun')}
                            placeholder="e.g., he/him, she/her, they/them"
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.pronoun && (
                            <p className="text-red-400 text-sm mt-1">{errors.pronoun.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="identity">Identity</Label>
                        <Input
                            id="identity"
                            {...register('identity')}
                            placeholder="e.g., Dr. Sarah Smith"
                            className="bg-slate-900 border-slate-700"
                        />
                        {errors.identity && (
                            <p className="text-red-400 text-sm mt-1">{errors.identity.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="tone_modifiers">Tone Modifiers (Optional)</Label>
                        <Input
                            id="tone_modifiers"
                            {...register('tone_modifiers')}
                            placeholder="e.g., professional, friendly"
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
                    setDeletingVariant(null);
                }}
                onConfirm={handleDelete}
                itemName={deletingVariant?.identity}
                isDeleting={isSubmitting}
            />
        </div>
    );
}
