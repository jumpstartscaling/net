// @ts-ignore - Astro types available at build time
import type { APIRoute } from 'astro';
import { getDirectusClient, readItems } from '@/lib/directus/client';

/**
 * Lead Export API - CSV Download
 * 
 * Exports leads for a specific site as CSV.
 * Clients can only see their own site's leads.
 * 
 * GET /api/leads/export?site_id={id}&format=csv
 */
export const GET: APIRoute = async ({ request, url }) => {
    try {
        const siteId = url.searchParams.get('site_id');
        const format = url.searchParams.get('format') || 'csv';
        const status = url.searchParams.get('status'); // Optional filter
        const startDate = url.searchParams.get('start_date');
        const endDate = url.searchParams.get('end_date');

        if (!siteId) {
            return new Response(
                JSON.stringify({ error: 'site_id is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const directus = getDirectusClient();

        // Build filter
        const filter: Record<string, any> = {
            site: { _eq: siteId }
        };

        if (status) {
            filter.status = { _eq: status };
        }

        if (startDate) {
            filter.date_created = { _gte: startDate };
        }

        if (endDate) {
            filter.date_created = { ...filter.date_created, _lte: endDate };
        }

        // Fetch leads for this site
        const leads = await directus.request(
            readItems('leads', {
                filter,
                sort: ['-date_created'],
                limit: -1, // All leads
                fields: [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'message',
                    'source',
                    'status',
                    'page_url',
                    'landing_page',
                    'referrer',
                    'utm_source',
                    'utm_medium',
                    'utm_campaign',
                    'value',
                    'notes',
                    'date_created'
                ]
            })
        );

        if (format === 'json') {
            return new Response(
                JSON.stringify({ leads, total: (leads as any[]).length }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Generate CSV
        const csvHeaders = [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Message',
            'Source',
            'Status',
            'Page URL',
            'Landing Page',
            'Referrer',
            'UTM Source',
            'UTM Medium',
            'UTM Campaign',
            'Value',
            'Notes',
            'Date Created'
        ];

        const csvRows = (leads as any[]).map(lead => [
            lead.id,
            escapeCsvField(lead.name),
            escapeCsvField(lead.email),
            escapeCsvField(lead.phone),
            escapeCsvField(lead.message),
            escapeCsvField(lead.source),
            escapeCsvField(lead.status),
            escapeCsvField(lead.page_url),
            escapeCsvField(lead.landing_page),
            escapeCsvField(lead.referrer),
            escapeCsvField(lead.utm_source),
            escapeCsvField(lead.utm_medium),
            escapeCsvField(lead.utm_campaign),
            lead.value || '',
            escapeCsvField(lead.notes),
            formatDate(lead.date_created)
        ].join(','));

        const csv = [csvHeaders.join(','), ...csvRows].join('\n');
        const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('Error exporting leads:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to export leads' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function escapeCsvField(value: string | null | undefined): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
}
