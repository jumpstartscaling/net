import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Users, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const BulkGenerator = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(10);
    const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'complete'>('idle');

    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const res = await fetch('/api/assembler/templates');
            return res.json();
        }
    });

    const runBulkJob = useMutation({
        mutationFn: async () => {
            // Placeholder for actual bulk job logic (Phase 5.b)
            return new Promise((resolve) => setTimeout(resolve, 3000));
        },
        onMutate: () => setJobStatus('running'),
        onSuccess: () => {
            setJobStatus('complete');
            toast.success(`Generated ${quantity} articles successfully!`);
        }
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">1. Select Template</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {templates?.map((t: any) => (
                            <div
                                key={t.id}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`p-3 rounded-md border cursor-pointer transition-colors ${selectedTemplate === t.id
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-card border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-medium text-sm">{t.pattern_name}</div>
                                <div className="text-xs text-muted-foreground truncate">{t.structure_type || 'Custom'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">2. Data Source</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Users className="h-6 w-6" />
                            <span className="text-xs">Profiles</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <MapPin className="h-6 w-6" />
                            <span className="text-xs">Geo Data</span>
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">3. Quantity</h3>
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={1}
                        max={1000}
                    />
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedTemplate || jobStatus === 'running'}
                    onClick={() => runBulkJob.mutate()}
                >
                    {jobStatus === 'running' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Bulk Job
                        </>
                    )}
                </Button>
            </Card>

            <div className="md:col-span-2">
                <Card className="h-full flex flex-col">
                    <div className="p-4 border-b border-border/50">
                        <h3 className="font-semibold">Job Queue & Results</h3>
                    </div>
                    {jobStatus === 'complete' ? (
                        <div className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Article Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>SEO Score</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">Top 10 Plumbing Tips in New York</TableCell>
                                            <TableCell><Badge className="bg-green-500/10 text-green-500">Ready</Badge></TableCell>
                                            <TableCell>92/100</TableCell>
                                            <TableCell className="text-muted-foreground">{new Date().toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <Calendar className="h-12 w-12 mb-4 opacity-20" />
                            <p>No jobs running</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default BulkGenerator;
