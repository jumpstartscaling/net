
import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    MarkerType,
    Node as ReactFlowNode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

// Custom Node Styles
const nodeStyle = {
    background: '#1e1e20',
    color: '#fff',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    padding: '10px',
    minWidth: '150px',
    fontSize: '12px',
};

const initialNodes = [
    { id: '1', position: { x: 250, y: 50 }, data: { label: '🚀 Start Trigger' }, style: { ...nodeStyle, border: '1px solid #eab308' } },
    { id: '2', position: { x: 250, y: 150 }, data: { label: '🔍 Fetch Keywords' }, style: nodeStyle },
    { id: '3', position: { x: 100, y: 250 }, data: { label: '📝 Generate Outline' }, style: nodeStyle },
    { id: '4', position: { x: 400, y: 250 }, data: { label: '🤖 Generate Content' }, style: nodeStyle },
    { id: '5', position: { x: 250, y: 350 }, data: { label: '✅ Publish to Site' }, style: { ...nodeStyle, border: '1px solid #22c55e' } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e4-5', source: '4', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
];

const AutomationBuilder = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onAddNode = () => {
        const id = (nodes.length + 1).toString();
        const newNode: ReactFlowNode = {
            id,
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            data: { label: `⚡ Action ${id}` },
            style: nodeStyle
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const onSave = () => {
        // nodes and edges are already typed by useNodesState and useEdgesState
        console.log('Flow saved:', { nodes: nodes as ReactFlowNode[], edges: edges as Edge[] });
        toast.success("Automation Workflow Saved!");
    }

    return (
        <div className="h-[calc(100vh-140px)] w-full flex flex-col gap-4">

            {/* Toolbar */}
            <Card className="p-3 flex justify-between items-center bg-card/50 backdrop-blur border-border/50">
                <div className="flex gap-2">
                    <Button size="sm" onClick={onAddNode} variant="outline">
                        <Plus className="h-4 w-4 mr-2" /> Add Action
                    </Button>
                    <div className="h-8 w-[1px] bg-border mx-2"></div>
                    <div className="text-sm text-muted-foreground pt-1">
                        Drag nodes to connect actions. Right click to configure.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={onSave}>
                        <Save className="h-4 w-4 mr-2" /> Save Workflow
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" /> Activate
                    </Button>
                </div>
            </Card>

            {/* Canvas */}
            <Card className="flex-1 overflow-hidden border-border/50 shadow-xl bg-[#111]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-black/20"
                >
                    <Controls className="bg-card border-border fill-foreground" />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.id === '1') return '#eab308';
                            if (n.id === '5') return '#22c55e';
                            return '#3f3f46';
                        }}
                        maskColor="#00000080"
                        className="bg-card border-border"
                    />
                    <Background color="#333" gap={16} />
                </ReactFlow>
            </Card>
        </div>
    );
};

export default AutomationBuilder;
