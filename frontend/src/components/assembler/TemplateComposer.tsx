import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Save, RefreshCw, Wand2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Variable {
    key: string;
    value: string;
}

const TemplateComposer = () => {
    const [template, setTemplate] = useState('');
    const [variables, setVariables] = useState<Variable[]>([
        { key: 'city', value: 'New York' },
        { key: 'niche', value: 'Plumbing' },
        { key: 'service', value: 'Emergency Repair' }
    ]);
    const [previewContent, setPreviewContent] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState('Untitled Template');

    // Load templates on mount
    const fetchTemplates = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const res = await fetch('/api/assembler/templates');
            return res.json();
        }
    });

    const saveTemplate = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/assembler/templates', {
                method: 'POST',
                body: JSON.stringify({
                    id: currentTemplateId,
                    title: templateName,
                    content: template
                })
            });
            return res.json();
        },
        onSuccess: (data) => {
            toast.success('Template saved successfully!');
            fetchTemplates.refetch();
            if (data.id) setCurrentTemplateId(data.id);
        },
        onError: () => toast.error('Failed to save template')
    });

    const loadTemplate = (tmpl: any) => {
        setTemplate(tmpl.pattern_structure || '');
        setTemplateName(tmpl.pattern_name || 'Untitled');
        setCurrentTemplateId(tmpl.id);
        toast.info(`Loaded: ${tmpl.pattern_name}`);
    };
    const generatePreview = useMutation({
        mutationFn: async () => {
            const varMap = variables.reduce((acc, curr) => {
                if (curr.key) acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>);

            const res = await fetch('/api/assembler/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template, variables: varMap })
            });

            if (!res.ok) throw new Error('Generation failed');
            return res.json();
        },
        onSuccess: (data) => {
            setPreviewContent(data.content);
            toast.success('Preview generated successfully');
        },
        onError: () => {
            toast.error('Failed to generate preview');
        }
    });

    const addVariable = () => {
        setVariables([...variables, { key: '', value: '' }]);
    };

    const updateVariable = (index: number, field: 'key' | 'value', val: string) => {
        const newVars = [...variables];
        newVars[index][field] = val;
        setVariables(newVars);
    };

    const removeVariable = (index: number) => {
        const newVars = [...variables];
        newVars.splice(index, 1);
        setVariables(newVars);
    };

    const insertVariable = (key: string) => {
        setTemplate(prev => prev + `{{${key}}}`);
    };

    // Initialize with a demo template if empty
    useEffect(() => {
        if (!template) {
            setTemplate("Welcome to {{city}}'s best {{niche}} provider!\n\nWe offer {premium|high-quality|top-rated} {{service}} for all residential customers.\n\n{Call us today|Contact us now|Get a quote} to learn more.");
        }
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">

            {/* Left Panel: Variables & Inputs */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Label className="font-bold text-base">Variables</Label>
                        <Button variant="ghost" size="sm" onClick={addVariable} className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {variables.map((v, i) => (
                            <div key={i} className="flex flex-col gap-2 p-2 rounded bg-background/50 border border-border/50 group">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Key (e.g. city)"
                                        value={v.key}
                                        onChange={(e) => updateVariable(i, 'key', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeVariable(i)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Value"
                                    value={v.value}
                                    onChange={(e) => updateVariable(i, 'value', e.target.value)}
                                    className="h-8 text-xs"
                                />
                                {v.key && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-6 text-[10px] w-full mt-1"
                                        onClick={() => insertVariable(v.key)}
                                    >
                                        Insert {`{{${v.key}}}`}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Center Panel: Template Editor */}
            <div className="lg:col-span-5 flex flex-col">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col h-full overflow-hidden">
                    <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-purple-500" />
                            <Input
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="h-7 text-sm font-semibold bg-transparent border-transparent hover:border-border focus:border-border w-48"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                            <Button size="sm" onClick={() => generatePreview.mutate()} disabled={generatePreview.isPending}>
                                {generatePreview.isPending ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4 mr-2 fill-current" />
                                )}
                                Generate
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <Textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="absolute inset-0 w-full h-full resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed focus-visible:ring-0"
                            placeholder="Write your content template here. Use {{variable}} for dynamic data and {option1|option2} for spintax."
                        />
                    </div>
                    <div className="p-2 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground flex justify-between">
                        <span>{template.length} chars</span>
                        <span>Markdown Supported</span>
                    </div>
                </Card>
            </div>

            {/* Right Panel: Live Preview */}
            <div className="lg:col-span-4 flex flex-col">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col h-full overflow-hidden border-l-4 border-l-primary/50">
                    <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Generated Output</span>
                            {previewContent && <span className="text-[10px] px-2 py-0.5 border rounded-full text-green-500 border-green-500/50 bg-green-500/10">Live</span>}
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-white/5 dark:bg-black/20">
                        {previewContent ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {previewContent}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <Play className="h-12 w-12 mb-4" />
                                <p>Click Generate to see preview</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TemplateComposer;
