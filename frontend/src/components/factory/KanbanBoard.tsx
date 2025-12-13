/**
 * Kanban Board Component
 * Drag-and-drop workflow for article production
 */

'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import KanbanCard from './KanbanCard';

type ArticleStatus = 'queued' | 'generating' | 'review' | 'approved' | 'published';

interface Article {
    id: string;
    title: string;
    status: ArticleStatus;
    geo_city?: string;
    seo_score?: number;
}

interface KanbanBoardProps {
    articles: Article[];
    onStatusChange: (articleId: string, newStatus: ArticleStatus) => void;
}

const columns: { id: ArticleStatus; title: string; color: string }[] = [
    { id: 'queued', title: 'Queued', color: 'slate' },
    { id: 'generating', title: 'Generating', color: 'electric' },
    { id: 'review', title: 'Review', color: 'yellow' },
    { id: 'approved', title: 'Approved', color: 'green' },
    { id: 'published', title: 'Published', color: 'gold' },
];

export default function KanbanBoard({ articles, onStatusChange }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const articleId = active.id as string;
        const newStatus = over.id as ArticleStatus;

        onStatusChange(articleId, newStatus);
        setActiveId(null);
    };

    const getColumnArticles = (status: ArticleStatus) => {
        return articles.filter(article => article.status === status);
    };

    const activeArticle = articles.find(a => a.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]">
                {columns.map((column) => {
                    const columnArticles = getColumnArticles(column.id);

                    return (
                        <div
                            key={column.id}
                            className="flex flex-col bg-void/50 border-r border-edge-subtle last:border-r-0 px-3"
                        >
                            {/* Column Header */}
                            <div className="sticky top-0 bg-void/90 backdrop-blur-sm py-4 mb-4 border-b border-edge-subtle">
                                <div className="flex items-center justify-between">
                                    <h3 className="spark-label text-silver">{column.title}</h3>
                                    <span className="spark-data text-sm">{columnArticles.length}</span>
                                </div>
                            </div>

                            {/* Droppable Zone */}
                            <SortableContext
                                id={column.id}
                                items={columnArticles.map(a => a.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex-1 space-y-3 overflow-y-auto pb-4">
                                    {columnArticles.map((article) => (
                                        <KanbanCard
                                            key={article.id}
                                            article={article}
                                            columnColor={column.color}
                                        />
                                    ))}

                                    {columnArticles.length === 0 && (
                                        <div className="flex items-center justify-center h-32 border-2 border-dashed border-edge-subtle rounded-lg">
                                            <p className="text-silver/50 text-sm">Drop here</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    );
                })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeArticle && (
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.05 }}
                        className="opacity-80"
                    >
                        <KanbanCard article={activeArticle} columnColor="gold" />
                    </motion.div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
