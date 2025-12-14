
export interface WPPost {
    id: number;
    date: string;
    slug: string;
    status: string;
    type: string;
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
}

export class WordPressClient {
    private baseUrl: string;
    private authHeader: string | null = null;

    constructor(domain: string, appPassword?: string) {
        // Normalize domain
        this.baseUrl = domain.replace(/\/$/, '');
        if (!this.baseUrl.startsWith('http')) {
            this.baseUrl = `https://${this.baseUrl}`;
        }

        if (appPassword) {
            // Assumes username is 'admin' or handled in the pass string if formatted 'user:pass'
            // Usually Application Passwords are just the pwd, requiring a user.
            // For now, let's assume the user passes "username:app_password" string or implemented later.
            // We'll stick to public GET for now which doesn't need auth for reading content usually.
            // If auth is needed:
            // this.authHeader = `Basic ${btoa(appPassword)}`; 
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/wp-json/`);
            return res.ok;
        } catch (e) {
            console.error("WP Connection Failed", e);
            return false;
        }
    }

    async getPages(limit = 100): Promise<WPPost[]> {
        const url = `${this.baseUrl}/wp-json/wp/v2/pages?per_page=${limit}`;
        return this.fetchCollection(url);
    }

    async getPosts(limit = 100, page = 1): Promise<WPPost[]> {
        const url = `${this.baseUrl}/wp-json/wp/v2/posts?per_page=${limit}&page=${page}`;
        return this.fetchCollection(url);
    }

    async getPost(postId: number): Promise<WPPost | null> {
        try {
            const url = `${this.baseUrl}/wp-json/wp/v2/posts/${postId}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error("Fetch Post Error", e);
            return null;
        }
    }

    async getAllPosts(): Promise<WPPost[]> {
        let allPosts: WPPost[] = [];
        let page = 1;
        let totalPages = 1;

        // First fetch to get total pages
        const url = `${this.baseUrl}/wp-json/wp/v2/posts?per_page=100&page=${page}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`WP API Error: ${res.status}`);

            const totalPagesHeader = res.headers.get('X-WP-TotalPages');
            if (totalPagesHeader) {
                totalPages = parseInt(totalPagesHeader, 10);
            }

            const data = await res.json();
            allPosts = [...allPosts, ...data];

            // Loop remaining pages
            // Process in parallel chunks if too many, but for now sequential is safer to avoid rate limits
            // or perform simple Promise.all for batches.
            // Let's do batches of 5 to speed it up.

            const remainingPages = [];
            for (let p = 2; p <= totalPages; p++) {
                remainingPages.push(p);
            }

            // Batch fetch
            const batchSize = 5;
            for (let i = 0; i < remainingPages.length; i += batchSize) {
                const batch = remainingPages.slice(i, i + batchSize);
                const promises = batch.map(p =>
                    fetch(`${this.baseUrl}/wp-json/wp/v2/posts?per_page=100&page=${p}`)
                        .then(r => r.json())
                );
                const results = await Promise.all(promises);
                results.forEach(posts => {
                    allPosts = [...allPosts, ...posts];
                });
            }

        } catch (e) {
            console.error("Fetch Error", e);
            throw e;
        }

        return allPosts;
    }

    async getCategories(): Promise<any[]> {
        // Fetch all categories
        return this.fetchCollection(`${this.baseUrl}/wp-json/wp/v2/categories?per_page=100`);
    }

    async getTags(): Promise<any[]> {
        // Fetch all tags
        return this.fetchCollection(`${this.baseUrl}/wp-json/wp/v2/tags?per_page=100`);
    }

    private async fetchCollection(url: string): Promise<any[]> {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`WP API Error: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error("Fetch Error", e);
            throw e;
        }
    }
}
