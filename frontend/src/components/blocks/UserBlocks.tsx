
import React from 'react';
import { useNode } from '@craftjs/core';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Text = ({ text, fontSize = 16, textAlign = 'left' }: { text: string; fontSize?: number; textAlign?: string }) => {
    const { connectors: { connect, drag }, actions: { setProp }, hasSelectedNode } = useNode((node) => ({
        hasSelectedNode: node.events.selected,
    }));

    return (
        <div
            ref={(ref) => { connect(drag(ref as HTMLElement)); }}
            onClick={() => !hasSelectedNode && setProp((props: any) => props.hasSelectedNode = true)}
            style={{ fontSize: `${fontSize}px`, textAlign: textAlign as any }}
            className="p-2 hover:outline hover:outline-1 hover:outline-blue-500 relative group"
        >
            {hasSelectedNode && (
                <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">Text</div>
            )}
            <p className="w-full">{text}</p>
        </div>
    );
};

export const TextSettings = () => {
    const { actions: { setProp }, fontSize, textAlign } = useNode((node) => ({
        fontSize: node.data.props.fontSize,
        textAlign: node.data.props.textAlign,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                    defaultValue={fontSize || 16}
                    max={100}
                    step={1}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setProp((props: any) => props.fontSize = val);
                    }}
                />
            </div>
            <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-2">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                        <button
                            key={align}
                            className={`px-2 py-1 border rounded ${textAlign === align ? 'bg-primary text-primary-foreground' : ''}`}
                            onClick={() => setProp((props: any) => props.textAlign = align)}
                        >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

Text.craft = {
    props: {
        text: 'Hi there',
        fontSize: 16,
        textAlign: 'left'
    },
    related: {
        settings: TextSettings,
    },
};

export const Container = ({ background = "#ffffff", padding = 20, children }: { background?: string; padding?: number; children?: React.ReactNode }) => {
    const { connectors: { connect, drag } } = useNode();
    return (
        <div
            ref={(ref) => { connect(drag(ref as HTMLElement)); }}
            style={{ background, padding: `${padding}px` }}
            className="border border-dashed border-gray-200 min-h-[100px]"
        >
            {children}
        </div>
    );
};

export const ContainerSettings = () => {
    const { background, padding, actions: { setProp } } = useNode((node) => ({
        background: node.data.props.background,
        padding: node.data.props.padding,
    }));

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                    type="color"
                    value={background}
                    onChange={(e) => {
                        const val = e.target.value;
                        setProp((props: any) => props.background = val);
                    }}
                />
            </div>
            <div className="space-y-2">
                <Label>Padding</Label>
                <Slider
                    defaultValue={padding}
                    max={100}
                    step={1}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setProp((props: any) => props.padding = val);
                    }}
                />
            </div>
        </div>
    );
};

Container.craft = {
    props: {
        background: '#ffffff',
        padding: 20
    },
    related: {
        settings: ContainerSettings,
    },
};
