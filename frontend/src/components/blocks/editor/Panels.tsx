
import React from 'react';
import { useEditor } from '@craftjs/core';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Box, Image, Layers } from 'lucide-react';
import { Text, Container } from './UserBlocks';

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <Card className="p-4 flex flex-col gap-3 bg-card/50 backdrop-blur">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1">Blocks</h3>

      <Button
        variant="outline"
        className="justify-start gap-2 cursor-move"
        ref={(ref) => connectors.create(ref!, <Text text="New Text Block" />)}
      >
        <Type className="h-4 w-4" />
        Text
      </Button>

      <Button
        variant="outline"
        className="justify-start gap-2 cursor-move"
        ref={(ref) => connectors.create(ref!, <Container padding={20} />)}
      >
        <Box className="h-4 w-4" />
        Container
      </Button>

      <Button variant="outline" className="justify-start gap-2" disabled>
        <Image className="h-4 w-4" />
        Image (Pro)
      </Button>

      <Button variant="outline" className="justify-start gap-2" disabled>
        <Layers className="h-4 w-4" />
        Layout (Pro)
      </Button>
    </Card>
  );
};

export const SettingsPanel = () => {
  // Fix: Correctly access node state using type assertion or checking if exists
  const { selected, actions } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      selected = {
        id: currentNodeId,
        name: node.data.displayName,
        settings: node.related && node.related.settings,
        isDeletable: (node.data as any).isDeletable !== false, // Use type assertion or default true
        props: node.data.props
      };
    }

    return { selected };
  });

  if (!selected) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur flex items-center justify-center text-center">
        <div className="text-muted-foreground text-sm">
          Select an element to edit properties
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-sm">{selected.name}</h3>
        {selected.isDeletable && (
          <Button variant="destructive" size="sm" onClick={() => actions.delete(selected.id)}>
            Delete
          </Button>
        )}
      </div>
      {selected.settings && React.createElement(selected.settings, { ...selected.props, setProp: (cb: any) => actions.setProp(selected.id, cb) })}
    </Card>
  )
}
