import React from 'react';

interface ContentProps {
    content: string;
}

export default function Content({ content }: ContentProps) {
    return (
        <section className="py-12 px-8">
            <div className="prose prose-lg dark:prose-invert mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
        </section>
    );
}
