import type { APIRoute } from 'astro';
import { assembleContent } from '@/lib/assembler/engine';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { template, variables } = body;

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template content is required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Run the Assembler Engine
    const processedContent = assembleContent(template, variables || {});

    // Calculate basic stats
    const stats = {
      originalLength: template.length,
      finalLength: processedContent.length,
      variableCount: Object.keys(variables || {}).length,
      processingTime: '0ms' // Placeholder, could measure performance
    };

    return new Response(JSON.stringify({
      content: processedContent,
      stats
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error('Assembler Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
