import { getDirectusClient, readItems, readItem, readSingleton, aggregate } from './client';
import type { Page, Post, Site, Globals, Navigation } from '@/types/schema';

const directus = getDirectusClient();

/**
 * Fetch a page by permalink (tenant-safe)
 */
export async function fetchPageByPermalink(
    permalink: string,
    siteId: string,
    options?: { preview?: boolean; token?: string }
): Promise<Page | null> {
    const filter: Record<string, any> = {
        permalink: { _eq: permalink },
        site: { _eq: siteId }
    };

    if (!options?.preview) {
        filter.status = { _eq: 'published' };
    }

    try {
        const pages = await directus.request(
            readItems('pages', {
                filter,
                limit: 1,
                fields: [
                    'id',
                    'title',
                    'permalink',
                    'status',
                    'seo_title',
                    'seo_description',
                    'seo_image',
                    {
                        blocks: {
                            id: true,
                            sort: true,
                            hide_block: true,
                            collection: true,
                            item: true
                        }
                    }
                ],
                deep: {
                    blocks: { _sort: ['sort'], _filter: { hide_block: { _neq: true } } }
                }
            })
        );

        return pages?.[0] || null;
    } catch (err) {
        console.error('Error fetching page:', err);
        return null;
    }
}

/**
 * Fetch site globals
 */
export async function fetchSiteGlobals(siteId: string): Promise<Globals | null> {
    try {
        const globals = await directus.request(
            readItems('globals', {
                filter: { site: { _eq: siteId } },
                limit: 1,
                fields: ['*']
            })
        );
        return globals?.[0] || null;
    } catch (err) {
        console.error('Error fetching globals:', err);
        return null;
    }
}

/**
 * Fetch site navigation
 */
export async function fetchNavigation(siteId: string): Promise<Partial<Navigation>[]> {
    try {
        const nav = await directus.request(
            readItems('navigation', {
                filter: { site: { _eq: siteId } },
                sort: ['sort'],
                fields: ['id', 'label', 'url', 'parent', 'target', 'sort']
            })
        );
        return nav || [];
    } catch (err) {
        console.error('Error fetching navigation:', err);
        return [];
    }
}

/**
 * Fetch posts for a site
 */
export async function fetchPosts(
    siteId: string,
    options?: { limit?: number; page?: number; category?: string }
): Promise<{ posts: Partial<Post>[]; total: number }> {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {
        site: { _eq: siteId },
        status: { _eq: 'published' }
    };

    if (options?.category) {
        filter.category = { _eq: options.category };
    }

    try {
        const [posts, countResult] = await Promise.all([
            directus.request(
                readItems('posts', {
                    filter,
                    limit,
                    offset,
                    sort: ['-published_at'],
                    fields: [
                        'id',
                        'title',
                        'slug',
                        'excerpt',
                        'featured_image',
                        'published_at',
                        'category',
                        'author',
                        'site',
                        'status',
                        'content'
                    ]
                })
            ),
            directus.request(
                aggregate('posts', {
                    aggregate: { count: '*' },
                    query: { filter }
                })
            )
        ]);

        return {
            posts: (posts as Partial<Post>[]) || [],
            total: Number(countResult?.[0]?.count || 0)
        };
    } catch (err) {
        console.error('Error fetching posts:', err);
        return { posts: [], total: 0 };
    }
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(
    slug: string,
    siteId: string
): Promise<Post | null> {
    try {
        const posts = await directus.request(
            readItems('posts', {
                filter: {
                    slug: { _eq: slug },
                    site: { _eq: siteId },
                    status: { _eq: 'published' }
                },
                limit: 1,
                fields: ['*']
            })
        );
        return posts?.[0] || null;
    } catch (err) {
        console.error('Error fetching post:', err);
        return null;
    }
}

/**
 * Fetch generated articles for a site
 */
export async function fetchGeneratedArticles(
    siteId: string,
    options?: { limit?: number; page?: number }
): Promise<{ articles: any[]; total: number }> {
    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    try {
        const [articles, countResult] = await Promise.all([
            directus.request(
                readItems('generated_articles', {
                    filter: { site_id: { _eq: Number(siteId) } },
                    limit,
                    offset,
                    sort: ['-date_created'],
                    fields: ['*']
                })
            ),
            directus.request(
                aggregate('generated_articles', {
                    aggregate: { count: '*' },
                    query: { filter: { site_id: { _eq: Number(siteId) } } }
                })
            )
        ]);

        return {
            articles: articles || [],
            total: Number(countResult?.[0]?.count || 0)
        };
    } catch (err) {
        console.error('Error fetching articles:', err);
        return { articles: [], total: 0 };
    }
}

/**
 * Fetch a single generated article by slug
 */
export async function fetchGeneratedArticleBySlug(
    slug: string,
    siteId: string
): Promise<any | null> {
    try {
        const articles = await directus.request(
            readItems('generated_articles', {
                filter: {
                    _and: [
                        { slug: { _eq: slug } },
                        { site_id: { _eq: Number(siteId) } },
                        { is_published: { _eq: true } }
                    ]
                },
                limit: 1,
                fields: ['*']
            })
        );
        return articles?.[0] || null;
    } catch (err) {
        console.error('Error fetching generated article:', err);
        return null;
    }
}

/**
 * Fetch SEO campaigns
 */
export async function fetchCampaigns(siteId?: string) {
    const filter: Record<string, any> = {};
    if (siteId) {
        filter._or = [
            { site: { _eq: siteId } },
            { site: { _null: true } }
        ];
    }

    try {
        return await directus.request(
            readItems('campaign_masters', {
                filter,
                sort: ['-date_created'],
                fields: ['*']
            })
        );
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        return [];
    }
}

/**
 * Fetch locations (states, counties, cities)
 */
export async function fetchStates() {
    return directus.request(
        readItems('locations_states', {
            sort: ['name'],
            fields: ['*']
        })
    );
}

export async function fetchCountiesByState(stateId: string) {
    return directus.request(
        readItems('locations_counties', {
            filter: { state: { _eq: stateId } },
            sort: ['name'],
            fields: ['*']
        })
    );
}

export async function fetchCitiesByCounty(countyId: string, limit = 50) {
    return directus.request(
        readItems('locations_cities', {
            filter: { county: { _eq: countyId } },
            sort: ['-population'],
            limit,
            fields: ['*']
        })
    );
}
