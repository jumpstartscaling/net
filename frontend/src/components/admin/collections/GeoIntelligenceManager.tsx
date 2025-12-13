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

// Validation schema
const geoIntelligenceSchema = z.object({
    location_key: z.string().min(1, 'Location key is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    county: z.string().optional(),
    zip_code: z.string().optional(),
    population: z.number().int().positive().optional(),
    median_income: z.number().positive().optional(),
    keywords: z.string().optional(),
    local_modifiers: z.string().optional(),
});

type GeoIntelligenceFormData = z.infer<typeof geoIntelligenceSchema>;

interface GeoIntelligence {
    id: string;
    location_key: string;
    city: string;
    state: string;
    county?: string;
    zip_code?: string;
    population?: number;
    median_income?: number;
    keywords?: string;
    local_modifiers?: string;
}

export default function GeoIntelligenceManager() {
    const [locations, setLocations] = useState<GeoIntelligence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<GeoIntelligence | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<GeoIntelligence | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<GeoIntelligenceFormData>({
        resolver: zodResolver(geoIntelligenceSchema),
    });

    // Load data
    const loadLocations = async () => {
        setIsLoading(true);
        try {
            const client = getDirectusClient();
            const data = await client.request(
                readItems('geo_intelligence', {
                    fields: ['*'],
                    sort: ['state', 'city'],
                })
            );
            setLocations(data as GeoIntelligence[]);
        } catch (error) {
            console.error('Error loading geo intelligence:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    // Handle create/edit
    const onSubmit = async (data: GeoIntelligenceFormData) => {
        setIsSubmitting(true);
        try {
            const client = getDirectusClient();

            if (editingLocation) {
                await client.request(
                    updateItem('geo_intelligence', editingLocation.id, data)
                );
            } else {
                await client.request(createItem('geo_intelligence', data));
            }

            await loadLocations();
            setIsModalOpen(false);
            reset();
            setEditingLocation(null);
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Failed to save location');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingLocation) return;

        setIsSubmitting(true);
        try {
            const client = getDirectusClient();
            await client.request(deleteItem('geo_intelligence', deletingLocation.id));
            await loadLocations();
            setIsDeleteOpen(false);
            setDeletingLocation(null);
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Failed to delete location');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit click
    const handleEdit = (location: GeoIntelligence) => {
        setEditingLocation(location);
        Object.keys(location).forEach((key) => {
            setValue(key as any, (location as any)[key]);
        });
        setIsModalOpen(true);
    };

    // Handle add click
    const handleAdd = () => {
        setEditingLocation(null);
        reset();
        setIsModalOpen(true);
    };

    // Handle delete click
    const handleDeleteClick = (location: GeoIntelligence) => {
        setDeletingLocation(location);
        setIsDeleteOpen(true);
    };

    // Export data
    const handleExport = () => {
        const dataStr = JSON.stringify(locations, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `geo-intelligence-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    // Table columns
    const columns: ColumnDef<GeoIntelligence>[] = [
        {
            accessorKey: 'location_key',
            header: 'Location Key',
            cell: ({ row }) => (
                <span className="font-medium text-white font-mono">{row.original.location_key}</span>
            ),
        },
        {
            accessorKey: 'city',
            header: 'City',
            cell: ({ row }) => (
                <span className="text-white">{row.original.city}</span>
            ),
        },
        {
            accessorKey: 'state',
            header: 'State',
        },
        {
            accessorKey: 'county',
            header: 'County',
            cell: ({ row }) => row.original.county || '—',
        },
        {
            accessorKey: 'population',
            header: 'Population',
            cell: ({ row }) =>
                row.original.population
                    ? row.original.population.toLocaleString()
                    : '—',
        },
        {
            accessorKey: 'median_income',
            header: 'Median Income',
            cell: ({ row }) =>
                row.original.median_income
                    ? `$${row.original.median_income.toLocaleString()}`
                    : '—',
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
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Total Locations</div>
                    <div className="text-3xl font-bold text-white">{locations.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">States Covered</div>
                    <div className="text-3xl font-bold text-green-400">
                        {new Set(locations.map((l) => l.state)).size}
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <div className="text-sm text-slate-400 mb-2">Avg Population</div>
                    <div className="text-3xl font-bold text-blue-400">
                        {locations.filter(l => l.population).length > 0
                            ? Math.round(
                                locations.reduce((sum, l) => sum + (l.population || 0), 0) /
                                locations.filter(l => l.population).length
                            ).toLocaleString()
                            : '—'}
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={locations}
                columns={columns}
                onAdd={handleAdd}
                onExport={handleExport}
                searchPlaceholder="Search locations..."
                addButtonText="Add Location"
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <CRUDModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingLocation(null);
                    reset();
                }}
                title={editingLocation ? 'Edit Location' : 'Add Location'}
                description="Configure geographic intelligence data"
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
            >
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="location_key">Location Key</Label>
                            <Input
                                id="location_key"
                                {...register('location_key')}
                                placeholder="e.g., austin-tx"
                                className="bg-slate-900 border-slate-700"
                            />
                            {errors.location_key && (
                                <p className="text-red-400 text-sm mt-1">{errors.location_key.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                {...register('city')}
                                placeholder="e.g., Austin"
                                className="bg-slate-900 border-slate-700"
                            />
                            {errors.city && (
                                <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                {...register('state')}
                                placeholder="e.g., TX"
                                className="bg-slate-900 border-slate-700"
                            />
                            {errors.state && (
                                <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="county">County (Optional)</Label>
                            <Input
                                id="county"
                                {...register('county')}
                                placeholder="e.g., Travis"
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="zip_code">ZIP Code (Optional)</Label>
                            <Input
                                id="zip_code"
                                {...register('zip_code')}
                                placeholder="e.g., 78701"
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>

                        <div>
                            <Label htmlFor="population">Population (Optional)</Label>
                            <Input
                                id="population"
                                type="number"
                                {...register('population', { valueAsNumber: true })}
                                placeholder="e.g., 950000"
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="median_income">Median Income (Optional)</Label>
                        <Input
                            id="median_income"
                            type="number"
                            {...register('median_income', { valueAsNumber: true })}
                            placeholder="e.g., 75000"
                            className="bg-slate-900 border-slate-700"
                        />
                    </div>

                    <div>
                        <Label htmlFor="keywords">Keywords (Optional)</Label>
                        <Textarea
                            id="keywords"
                            {...register('keywords')}
                            placeholder="e.g., tech hub, live music, BBQ"
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label htmlFor="local_modifiers">Local Modifiers (Optional)</Label>
                        <Textarea
                            id="local_modifiers"
                            {...register('local_modifiers')}
                            placeholder="e.g., Keep Austin Weird, Silicon Hills"
                            className="bg-slate-900 border-slate-700"
                            rows={2}
                        />
                    </div>
                </form>
            </CRUDModal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setDeletingLocation(null);
                }}
                onConfirm={handleDelete}
                itemName={deletingLocation ? `${deletingLocation.city}, ${deletingLocation.state}` : undefined}
                isDeleting={isSubmitting}
            />
        </div>
    );
}
