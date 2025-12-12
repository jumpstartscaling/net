# Spark Platform

A powerful multi-tenant website platform with SEO automation, content generation, and lead capture.

## 🚀 Features

### Multi-Tenant Website Engine
- Domain-based site routing
- Per-site content isolation
- Global admin + tenant admin access

### Page Builder
- **Hero Block** - Full-width headers with CTAs
- **Rich Text Block** - SEO-optimized prose content
- **Columns Block** - Flexible multi-column layouts
- **Media Block** - Images and videos with captions
- **Steps Block** - Numbered process visualization
- **Quote Block** - Testimonials and blockquotes
- **Gallery Block** - Image grids with hover effects
- **FAQ Block** - Collapsible accordions with schema.org markup
- **Posts Block** - Blog listing with multiple layouts
- **Form Block** - Lead capture with validation

### Agentic SEO Content Engine
- **Campaign Management** - Create SEO campaigns with spintax
- **Headline Generation** - Cartesian product of spintax variations
- **Content Fragments** - Modular 6-pillar content blocks
- **Article Assembly** - Automated 2000+ word article generation
- **Location Targeting** - Generate location-specific content

### US Location Database
- All 50 states + DC
- All 3,143 counties
- Top 50 cities per county by population

### Feature Image Generation
- SVG templates with variable substitution
- Server-side rendering (node-canvas)
- Queue-based batch processing

### Lead Capture
- Customizable forms
- Newsletter subscriptions
- Lead management dashboard

## 📁 Project Structure

```
spark/
├── frontend/                 # Astro SSR Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # Admin dashboard components
│   │   │   ├── blocks/      # Page builder blocks
│   │   │   └── ui/          # ShadCN-style UI components
│   │   ├── layouts/         # Page layouts
│   │   ├── lib/
│   │   │   └── directus/    # Directus SDK client
│   │   ├── pages/
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   └── api/         # API endpoints
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── directus/                 # Directus Backend
│   ├── scripts/             # Import/automation scripts
│   ├── template/
│   │   └── src/             # Schema definitions
│   │       ├── collections.json
│   │       ├── fields.json
│   │       └── relations.json
│   └── Dockerfile
│
├── docker-compose.yaml       # Full stack orchestration
├── .env.example             # Environment template
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### 1. Clone and Configure

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Start with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Import Schema

```bash
# Enter Directus container
docker-compose exec directus sh

# Install dependencies and import schema
cd /directus
npm install
node scripts/import_template.js

# Load US location data
node scripts/load_locations.js
```

### 4. Access the Platform

- **Frontend**: http://localhost:4321
- **Admin Dashboard**: http://localhost:4321/admin
- **Directus API**: http://localhost:8055
- **Directus Admin**: http://localhost:8055/admin

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Directus Schema Updates

Edit the files in `directus/template/src/` and run:

```bash
node scripts/import_template.js
```

## 📊 SEO Content Engine Usage

### 1. Create a Campaign

In Directus Admin:
1. Go to **SEO Engine → Campaign Masters**
2. Create a new campaign with:
   - Name: "Local Dental SEO"
   - Headline Spintax: `{Best|Top|Leading} {Dentist|Dental Clinic} in {city}, {state}`
   - Location Mode: "City"

### 2. Add Content Fragments

Create fragments for each pillar:
- **intro_hook** (~200 words)
- **pillar_1_keyword** (~300 words)
- **pillar_2_uniqueness** (~300 words)
- **pillar_3_relevance** (~300 words)
- **pillar_4_quality** (~300 words)
- **pillar_5_authority** (~300 words)
- **pillar_6_backlinks** (~300 words)
- **faq_section** (~200 words)

Use spintax and variables:
```html
<p>Looking for the {best|top|leading} {service} in {city}? 
{Our team|We} {specialize in|focus on} {providing|delivering} 
{exceptional|outstanding} {results|outcomes}.</p>
```

### 3. Generate Headlines

Click "Generate Headlines" to create the headline inventory from spintax permutations.

### 4. Generate Articles

Select a campaign and click "Generate" to create unique SEO articles automatically.

## 🌐 Deployment

### Coolify

1. Create a new Docker Compose service
2. Connect your Git repository
3. Set environment variables
4. Deploy

### Manual Deployment

```bash
# Build images
docker-compose build

# Push to registry
docker tag spark-frontend your-registry/spark-frontend
docker push your-registry/spark-frontend

# Deploy on server
docker-compose -f docker-compose.prod.yaml up -d
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lead` | POST | Submit lead form |
| `/api/campaigns` | GET/POST | Manage SEO campaigns |
| `/api/seo/generate-headlines` | POST | Generate headlines from spintax |
| `/api/seo/generate-article` | POST | Generate articles |
| `/api/seo/articles` | GET | List generated articles |
| `/api/locations/states` | GET | List US states |
| `/api/locations/counties` | GET | List counties by state |
| `/api/locations/cities` | GET | List cities by county |
| `/api/media/templates` | GET/POST | Manage image templates |

## 🔐 Multi-Tenant Access Control

| Role | Access |
|------|--------|
| **Super Admin** | All sites, global settings, location database |
| **Site Admin** | Own site only, content, SEO campaigns |

## 📄 License

MIT License - See LICENSE file for details.

---

Built with ❤️ using Astro, React, Directus, and PostgreSQL.
