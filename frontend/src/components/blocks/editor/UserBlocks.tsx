
import React from 'react';
import { useNode } from '@craftjs/core';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// --- Types ---
interface TextProps {
  text?: string;
}

interface ContainerProps {
  children?: React.ReactNode;
  padding?: number;
  background?: string;
}

// --- Components ---

export const Text = ({ text = "Edit me" }: TextProps) => {
  const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Fix: Explicitly type the 'props' argument in setProp callback
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    setProp((props: any) => props.text = newText);
  };

  const handleClick = () => {
    if (!selected) {
      setProp((props: any) => props.text = text);
    }
  }

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      onClick={handleClick}
      contentEditable={selected}
      suppressContentEditableWarning
      onBlur={handleInput}
      className={`p-2 transition-all outline-none ${selected ? "ring-2 ring-primary ring-offset-2 rounded" : "hover:bg-primary/5"}`}
    >
      {text}
    </div>
  );
};

// Craft config for Text
(Text as any).craft = {
  displayName: "Text Block",
  props: {
    text: "Start typing..."
  },
  related: {
    settings: () => (
      <div className="p-4">
        <Label>Typography Settings</Label>
        <p className="text-xs text-muted-foreground mt-2">Edit text directly on the canvas.</p>
      </div>
    )
  }
};

export const Container = ({ children, padding = 20, background = 'transparent' }: ContainerProps) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      className={`border border-dashed transition-all ${selected ? "border-primary" : "border-border/50 hover:border-primary/50"}`}
      style={{ padding: `${padding}px`, backgroundColor: background }}
    >
      {children}
    </div>
  );
};

// Craft config for Container
(Container as any).craft = {
  displayName: "Section Container",
  props: {
    padding: 20,
    background: 'transparent'
  },
  related: {
    settings: ({ padding, setProp }: any) => (
      <div className="p-4 space-y-4">
        <div>
          <Label>Padding ({padding}px)</Label>
          <Slider
            value={[padding]}
            max={100}
            step={5}
            onValueChange={(val: number[]) => setProp((props: any) => props.padding = val[0])}
          />
        </div>
      </div>
    )
  }
};
