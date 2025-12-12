/**
 * Module Flow Builder Component
 * 
 * Visual node-based editor for building content recipes.
 * Users drag and connect module blocks to define article structure.
 */
import React, { useState, useCallback } from 'react';

interface ModuleNode {
    id: string;
    type: string;
    label: string;
    icon: string;
    color: string;
    x: number;
    y: number;
}

interface Connection {
    from: string;
    to: string;
}

interface ModuleFlowProps {
    onRecipeChange?: (recipe: string[]) => void;
}

const MODULE_TYPES = [
    { type: 'intro', label: 'Intro/Hook', icon: '🎯', color: '#8b5cf6' },
    { type: 'definition', label: 'Definition', icon: '📖', color: '#3b82f6' },
    { type: 'benefits', label: 'Benefits', icon: '✨', color: '#10b981' },
    { type: 'howto', label: 'How-To Steps', icon: '📝', color: '#f59e0b' },
    { type: 'comparison', label: 'Comparison', icon: '⚖️', color: '#ef4444' },
    { type: 'faq', label: 'FAQ', icon: '❓', color: '#06b6d4' },
    { type: 'conclusion', label: 'Conclusion/CTA', icon: '🚀', color: '#ec4899' },
];

export const ModuleFlow: React.FC<ModuleFlowProps> = ({ onRecipeChange }) => {
    const [nodes, setNodes] = useState<ModuleNode[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [dragging, setDragging] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<string | null>(null);

    const addNode = useCallback((type: typeof MODULE_TYPES[0]) => {
        const newNode: ModuleNode = {
            id: `node-${Date.now()}`,
            type: type.type,
            label: type.label,
            icon: type.icon,
            color: type.color,
            x: 100 + (nodes.length * 50) % 300,
            y: 100 + Math.floor(nodes.length / 3) * 100
        };

        const updatedNodes = [...nodes, newNode];
        setNodes(updatedNodes);
        updateRecipe(updatedNodes, connections);
    }, [nodes, connections, onRecipeChange]);

    const removeNode = useCallback((id: string) => {
        const updatedNodes = nodes.filter(n => n.id !== id);
        const updatedConnections = connections.filter(c => c.from !== id && c.to !== id);
        setNodes(updatedNodes);
        setConnections(updatedConnections);
        updateRecipe(updatedNodes, updatedConnections);
    }, [nodes, connections]);

    const handleMouseDown = (id: string, e: React.MouseEvent) => {
        if (e.shiftKey) {
            setConnecting(id);
        } else {
            setDragging(id);
        }
    };

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!dragging) return;

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes(nodes.map(n =>
            n.id === dragging ? { ...n, x, y } : n
        ));
    }, [dragging, nodes]);

    const handleMouseUp = (targetId?: string) => {
        if (connecting && targetId && connecting !== targetId) {
            // Don't add duplicate connections
            const exists = connections.some(c => c.from === connecting && c.to === targetId);
            if (!exists) {
                const updatedConnections = [...connections, { from: connecting, to: targetId }];
                setConnections(updatedConnections);
                updateRecipe(nodes, updatedConnections);
            }
        }
        setDragging(null);
        setConnecting(null);
    };

    const updateRecipe = (currentNodes: ModuleNode[], currentConnections: Connection[]) => {
        // Build recipe from connected flow
        // Start from nodes that have no incoming connections
        const hasIncoming = new Set(currentConnections.map(c => c.to));
        const startNodes = currentNodes.filter(n => !hasIncoming.has(n.id));

        const visited = new Set<string>();
        const recipe: string[] = [];

        const traverse = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);

            const node = currentNodes.find(n => n.id === nodeId);
            if (node) {
                recipe.push(node.type);
                currentConnections
                    .filter(c => c.from === nodeId)
                    .forEach(c => traverse(c.to));
            }
        };

        startNodes.forEach(n => traverse(n.id));

        // Add any unconnected nodes
        currentNodes.forEach(n => {
            if (!visited.has(n.id)) {
                recipe.push(n.type);
            }
        });

        onRecipeChange?.(recipe);
    };

    return (
        <div className="module-flow-container">
            {/* Palette */}
            <div className="module-palette">
                <h4>📦 Content Modules</h4>
                <p className="palette-hint">Click to add, Shift+Drag to connect</p>
                <div className="palette-items">
                    {MODULE_TYPES.map(type => (
                        <button
                            key={type.type}
                            className="palette-item"
                            style={{ borderColor: type.color }}
                            onClick={() => addNode(type)}
                        >
                            <span className="item-icon">{type.icon}</span>
                            <span className="item-label">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="flow-canvas-container">
                <svg
                    className="flow-canvas"
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => handleMouseUp()}
                    onMouseLeave={() => handleMouseUp()}
                >
                    {/* Connection lines */}
                    {connections.map((conn, i) => {
                        const from = nodes.find(n => n.id === conn.from);
                        const to = nodes.find(n => n.id === conn.to);
                        if (!from || !to) return null;

                        return (
                            <line
                                key={i}
                                x1={from.x + 60}
                                y1={from.y + 30}
                                x2={to.x}
                                y2={to.y + 30}
                                stroke="#3b82f6"
                                strokeWidth={2}
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}

                    {/* Arrow marker */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                        </marker>
                    </defs>

                    {/* Nodes */}
                    {nodes.map(node => (
                        <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            onMouseDown={(e) => handleMouseDown(node.id, e)}
                            onMouseUp={() => handleMouseUp(node.id)}
                            style={{ cursor: 'grab' }}
                        >
                            <rect
                                width={120}
                                height={60}
                                rx={8}
                                fill="#1a1a2e"
                                stroke={node.color}
                                strokeWidth={2}
                            />
                            <text x={15} y={25} fontSize={18}>{node.icon}</text>
                            <text x={40} y={28} fill="#fff" fontSize={12}>{node.label}</text>
                            <text
                                x={108}
                                y={18}
                                fill="#888"
                                fontSize={14}
                                onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                                style={{ cursor: 'pointer' }}
                            >×</text>
                            <text x={15} y={48} fill="#666" fontSize={10}>
                                {node.type}
                            </text>
                        </g>
                    ))}

                    {nodes.length === 0 && (
                        <text x="50%" y="50%" textAnchor="middle" fill="#666">
                            Click modules from the palette to add them here
                        </text>
                    )}
                </svg>
            </div>

            {/* Recipe Preview */}
            <div className="recipe-preview">
                <h4>📜 Current Recipe</h4>
                <div className="recipe-items">
                    {nodes.length === 0 ? (
                        <span className="empty">No modules added</span>
                    ) : (
                        nodes.map((n, i) => (
                            <span key={n.id} className="recipe-item" style={{ background: n.color }}>
                                {n.icon} {n.type}
                                {i < nodes.length - 1 && <span className="arrow">→</span>}
                            </span>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                .module-flow-container {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    grid-template-rows: 1fr auto;
                    gap: 16px;
                    height: 500px;
                }
                
                .module-palette {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 16px;
                    grid-row: 1 / 3;
                }
                
                .module-palette h4 {
                    color: #fff;
                    margin-bottom: 8px;
                }
                
                .palette-hint {
                    font-size: 0.75rem;
                    color: #666;
                    margin-bottom: 16px;
                }
                
                .palette-items {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .palette-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #e0e0e0;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                
                .palette-item:hover {
                    background: rgba(255,255,255,0.08);
                    transform: translateX(4px);
                }
                
                .item-icon {
                    font-size: 1.2rem;
                }
                
                .item-label {
                    font-size: 0.85rem;
                }
                
                .flow-canvas-container {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .flow-canvas {
                    width: 100%;
                    height: 100%;
                    min-height: 400px;
                }
                
                .recipe-preview {
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    padding: 16px;
                }
                
                .recipe-preview h4 {
                    color: #fff;
                    margin-bottom: 12px;
                }
                
                .recipe-items {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                
                .recipe-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 0.85rem;
                    color: #fff;
                }
                
                .recipe-item .arrow {
                    margin-left: 8px;
                    color: #666;
                }
                
                .empty {
                    color: #666;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default ModuleFlow;
