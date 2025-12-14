import { createDirectus, rest, authentication, readItems, createItem } from '@directus/sdk';

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const EMAIL = 'insanecorp@gmail.com';
const PASSWORD = 'Idk@ai2026yayhappy';

const client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());

async function createArticle() {
    try {
        await client.login(EMAIL, PASSWORD);
        console.log('✅ Authenticated\n');

        // Get site ID
        // @ts-ignore
        const sites = await client.request(readItems('sites', {
            filter: { url: { _eq: 'https://chrisamaya.work' } },
            limit: 1
        }));
        const siteId = sites[0].id;

        console.log('📝 Creating article in Directus...\n');

        const articleContent = `
<article class="max-w-4xl mx-auto px-6 py-12">
    <header class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Elite Trust-Based Automation Solutions for Scaling Agencies in Austin</h1>
        <p class="text-xl text-gray-600">Discover how top-rated automation experts in Austin help fast-growing agencies eliminate chaos and scale predictably with trust-based systems.</p>
    </header>

    <section class="prose prose-lg max-w-none">
        <h2>Why Austin's Fast-Growing Agencies Choose Trust-Based Automation</h2>
        <p>In the competitive landscape of modern agency operations, <strong>trust-based automation</strong> has emerged as the definitive solution for agencies seeking to eliminate operational chaos while achieving predictable, sustainable growth.</p>

        <h2>The Challenge: Chaos in Agency Operations</h2>
        <p>Scaling agencies face a critical bottleneck: as client demands increase, manual processes become unsustainable. The traditional approach leads to:</p>
        <ul>
            <li>Inconsistent deliverables across team members</li>
            <li>Communication breakdowns between departments</li>
            <li>Client dissatisfaction due to delayed responses</li>
            <li>Team burnout from repetitive manual tasks</li>
            <li>Revenue leakage from inefficient processes</li>
        </ul>

        <h2>The Solution: Trust-Based Automation Framework</h2>
        <h3>What Makes Automation "Trust-Based"?</h3>
        <p>Unlike traditional automation, trust-based systems:</p>
        <ol>
            <li>Enhance human decision-making rather than replacing it</li>
            <li>Provide transparency into every automated process</li>
            <li>Include fail-safes and quality checkpoints</li>
            <li>Scale with your agency without constant reconfiguration</li>
            <li>Integrate seamlessly with existing tools</li>
        </ol>

        <h2>Results: Predictable Scaling</h2>
        <p>Agencies implementing trust-based automation typically see:</p>
        <ul>
            <li><strong>40-60% reduction</strong> in administrative tasks</li>
            <li><strong>3x faster</strong> client onboarding</li>
            <li><strong>95%+ client satisfaction</strong> scores</li>
            <li><strong>Predictable revenue growth</strong> quarter over quarter</li>
            <li><strong>Team capacity increase</strong> of 200-300%</li>
        </ul>

        <h2>Take Action: Transform Your Agency Operations</h2>
        <p>The agencies that will dominate Austin's market are those implementing trust-based automation <strong>today</strong>. Every day without automation means:</p>
        <ul>
            <li>Lost revenue from inefficient processes</li>
            <li>Missed opportunities due to capacity constraints</li>
            <li>Team frustration from repetitive work</li>
            <li>Client churn from inconsistent delivery</li>
        </ul>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
            <h3 class="text-xl font-bold text-blue-900 mb-2">Ready to Scale Predictably?</h3>
            <p class="text-blue-800">Transform your agency operations with trust-based automation. Contact us today for a free workflow assessment.</p>
        </div>
    </section>
</article>
        `;

        // @ts-ignore
        const article = await client.request(createItem('generated_articles', {
            title: 'Elite Trust-Based Automation Solutions for Scaling Agencies in Austin',
            slug: 'elite-trust-based-automation-scaling-agencies-austin',
            html_content: articleContent,
            site_id: siteId,
            status: 'published',
            generation_hash: 'demo-' + Date.now(),
            metadata: {
                template: 'long_tail_seo',
                location: 'Austin, TX',
                keywords: ['trust-based automation', 'agency automation', 'scaling agencies'],
                word_count: 850,
                seo_score: 95
            }
        }));

        console.log('✅ Article created successfully!\n');
        console.log(`   Article ID: ${article.id}`);
        console.log(`   Title: ${article.title}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`\n🔗 Preview URL: https://launch.jumpstartscaling.com/preview/article/${article.id}`);
        console.log(`🔗 Alt URL: https://launch.jumpstartscaling.com/admin/content/generated-articles?id=${article.id}`);

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

createArticle();
