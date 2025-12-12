
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

    async getPosts(limit = 100): Promise<WPPost[]> {
        const url = `${this.baseUrl}/wp-json/wp/v2/posts?per_page=${limit}`;
        return this.fetchCollection(url);
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
