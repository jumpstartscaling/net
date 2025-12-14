
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, Search, FileText } from 'lucide-react';
// We import the analysis functions directly since this is a client component in Astro/React
import { analyzeSeo, analyzeReadability } from '@/lib/testing/seo';

const TestRunner = () => {
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<any>(null);

    const runTests = () => {
        const seo = analyzeSeo(content, keyword);
        const read = analyzeReadability(content);

        setResults({ seo, read });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">

            {/* Input Column */}
            <div className="flex flex-col gap-4">
                <Card className="p-4 space-y-4 bg-card/50 backdrop-blur">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Content Source
                    </h3>
                    <div className="space-y-2">
                        <Input
                            placeholder="Target Keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Textarea
                            className="min-h-[400px] font-mono text-sm"
                            placeholder="Paste content here to analyze..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <Button onClick={runTests} className="w-full">
                        <Search className="h-4 w-4 mr-2" /> Run Analysis
                    </Button>
                </Card>
            </div>

            {/* Results Column */}
            <div className="flex flex-col gap-4 overflow-y-auto">
                {results ? (
                    <>
                        <Card className="p-6 bg-card/50 backdrop-blur space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-semibold">SEO Score</h3>
                                    <span className={`font-bold ${results.seo.score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {results.seo.score}/100
                                    </span>
                                </div>
                                <Progress value={results.seo.score} className="h-2" />
                                <div className="mt-4 space-y-2">
                                    {results.seo.issues.length === 0 && (
                                        <div className="flex items-center gap-2 text-green-500 text-sm">
                                            <CheckCircle2 className="h-4 w-4" /> No issues found!
                                        </div>
                                    )}
                                    {results.seo.issues.map((issue: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-yellow-500 text-sm">
                                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <div className="flex justify-between mb-2">
                                    <h3 className="font-semibold">Readability</h3>
                                    <span className="text-muted-foreground text-sm">{results.read.feedback}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-background/50 rounded border border-border/50 text-center">
                                        <div className="text-2xl font-bold">{results.read.gradeLevel}</div>
                                        <div className="text-xs text-muted-foreground">Grade Level</div>
                                    </div>
                                    <div className="p-3 bg-background/50 rounded border border-border/50 text-center">
                                        <div className="text-2xl font-bold">{results.read.score}</div>
                                        <div className="text-xs text-muted-foreground">Flow Score</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </>
                ) : (
                    <Card className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground opacity-50 border-dashed">
                        <Search className="h-12 w-12 mb-4" />
                        <p>No results yet. Run analysis to see scores.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TestRunner;
