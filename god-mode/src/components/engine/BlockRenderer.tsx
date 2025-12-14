import React from 'react';
import Hero from './blocks/Hero';
import Content from './blocks/Content';
import Features from './blocks/Features';

interface Block {
    id: string;
    block_type: string;
    block_config: any;
}

interface BlockRendererProps {
    blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    return (
        <div className="flex flex-col">
            {blocks.map(block => {
                switch (block.block_type) {
                    case 'hero':
                        return <Hero key={block.id} {...block.block_config} />;
                    case 'content':
                        return <Content key={block.id} {...block.block_config} />;
                    case 'features':
                        return <Features key={block.id} {...block.block_config} />;
                    case 'cta':
                        // reuse Hero styled as CTA or simple banner
                        return <Hero key={block.id} {...block.block_config} bg="dark" />;
                    default:
                        console.warn(`Unknown block type: ${block.block_type}`);
                        return null;
                }
            })}
        </div>
    );
}
