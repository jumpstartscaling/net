/**
 * Kanban Card Component
 * Individual article card in Kanban view
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Article {
    id: string;
    title: string;
    status: string;
    geo_city?: string;
    seo_score?: number;
}

interface KanbanCardProps {
    article: Article;
    columnColor: string;
}

export default function KanbanCard({ article, columnColor }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: article.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getBorderColor = () => {
        switch (columnColor) {
            case 'electric': return 'border-electric-400';
            case 'yellow': return 'border-yellow-500';
            case 'green': return 'border-green-500';
            case 'gold': return 'border-edge-gold';
            default: return 'border-edge-normal';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        group spark-card spark-card-hover p-4 cursor-grab active:cursor-grabbing
        ${getBorderColor()}
        transition-all duration-200
      `}
        >
            {/* Title */}
            <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
                {article.title}
            </h4>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs">
                {article.geo_city && (
                    <span className="text-silver">📍 {article.geo_city}</span>
                )}

                {article.seo_score !== undefined && (
                    <span className="spark-data">
                        {article.seo_score}/100
                    </span>
                )}
            </div>

            {/* Drag Handle Visual */}
            <div className="mt-3 pt-3 border-t border-edge-subtle flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-silver/30"></div>
                    <div className="w-1 h-1 rounded-full bg-silver/30"></div>
                    <div className="w-1 h-1 rounded-full bg-silver/30"></div>
                </div>
            </div>
        </div>
    );
}
