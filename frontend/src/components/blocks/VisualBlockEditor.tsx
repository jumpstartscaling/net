
import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Smartphone, Monitor } from 'lucide-react';
import { Text, Container } from './UserBlocks';
import { Toolbox, SettingsPanel } from './Panels';

const ViewportHeader = () => {
    return (
        <div className="flex items-center justify-between p-2 border-b bg-card/30">
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Smartphone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-muted"><Monitor className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Undo className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Redo className="h-4 w-4" /></Button>
            </div>
        </div>
    )
}

const VisualBlockEditor = () => {
    return (
        <div className="h-[calc(100vh-140px)] w-full">
            <Editor resolver={{ Text, Container }}>
                <div className="grid grid-cols-12 gap-6 h-full">

                    {/* Left: Toolbox */}
                    <div className="col-span-2">
                        <Toolbox />
                    </div>

                    {/* Center: Canvas */}
                    <div className="col-span-7 flex flex-col h-full">
                        <Card className="flex-1 flex flex-col bg-background/50 overflow-hidden border-border/50">
                            <ViewportHeader />
                            <div className="flex-1 p-8 bg-black/5 dark:bg-black/20 overflow-y-auto">
                                <div className="bg-background shadow-lg min-h-[800px] w-full max-w-3xl mx-auto rounded-md overflow-hidden">
                                    <Frame>
                                        <Element is={Container} padding={40} background="#ffffff05" canvas>
                                            <Text text="Welcome to the Visual Editor" />
                                            <Element is={Container} padding={20} background="#00000020" canvas>
                                                <Text text="Drag blocks from the left to build your page." />
                                            </Element>
                                        </Element>
                                    </Frame>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Settings */}
                    <div className="col-span-3">
                        <SettingsPanel />
                    </div>
                </div>
            </Editor>
        </div>
    );
};

export default VisualBlockEditor;
