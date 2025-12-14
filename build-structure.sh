#!/bin/bash

# Spark Platform - Complete File Structure Builder
# Run this to create all files for Milestones 1-3

cd /Users/christopheramaya/Downloads/spark/frontend/src

echo "🏗️  Building complete Spark Platform file structure..."
echo ""

# Create all directories
echo "📁 Creating directories..."
mkdir -p components/admin/intelligence
mkdir -p components/admin/factory
mkdir -p components/admin/leads
mkdir -p components/admin/jobs
mkdir -p components/admin/scheduler
mkdir -p components/admin/collections
mkdir -p components/admin/sites
mkdir -p components/admin/content
mkdir -p components/admin/campaigns
mkdir -p components/admin/system
mkdir -p pages/admin/leads
mkdir -p pages/admin/scheduler
mkdir -p pages/admin/sites
mkdir -p pages/admin/campaigns
mkdir -p pages/admin/system

# MILESTONE 1: Intelligence Library (TOP PRIORITY)
echo ""
echo "📚 MILESTONE 1: Creating Intelligence Library components..."
echo "   → Avatar Intelligence..."
touch components/admin/intelligence/AvatarIntelligenceManager.tsx
touch components/admin/intelligence/AvatarCard.tsx
touch components/admin/intelligence/AvatarEditModal.tsx
touch components/admin/intelligence/AvatarStats.tsx
touch components/admin/intelligence/GenerateVariantsModal.tsx

echo "   → Avatar Variants..."
touch components/admin/intelligence/AvatarVariantsManager.tsx
touch components/admin/intelligence/VariantCard.tsx
touch components/admin/intelligence/VariantEditModal.tsx
touch components/admin/intelligence/VariantPreview.tsx

echo "   → Geo Intelligence..."
touch components/admin/intelligence/GeoIntelligenceManager.tsx
touch components/admin/intelligence/GeoMap.tsx
touch components/admin/intelligence/ClusterCard.tsx
touch components/admin/intelligence/LocationEditModal.tsx
touch components/admin/intelligence/GeoStats.tsx

echo "   → Spintax Dictionaries..."
touch components/admin/intelligence/SpintaxManager.tsx
touch components/admin/intelligence/SpintaxCategory.tsx
touch components/admin/intelligence/SpintaxEditModal.tsx
touch components/admin/intelligence/SpintaxPreview.tsx
touch components/admin/intelligence/SpintaxImport.tsx

echo "   → Cartesian Patterns..."
touch components/admin/intelligence/CartesianManager.tsx
touch components/admin/intelligence/PatternCard.tsx
touch components/admin/intelligence/PatternEditModal.tsx
touch components/admin/intelligence/PatternBuilder.tsx
touch components/admin/intelligence/PatternPreview.tsx

# MILESTONE 2: Factory & Forms
echo ""
echo "🏭 MILESTONE 2: Creating Factory components..."
echo "   → Kanban Board..."
touch components/admin/factory/KanbanBoard.tsx
touch components/admin/factory/KanbanColumn.tsx
touch components/admin/factory/ArticleCard.tsx
touch components/admin/factory/CardActions.tsx
touch components/admin/factory/BulkActions.tsx

echo "   → Lead Management..."
touch components/admin/leads/LeadManager.tsx
touch components/admin/leads/LeadForm.tsx
touch components/admin/leads/LeadTable.tsx
touch components/admin/leads/LeadStats.tsx
touch components/admin/leads/LeadExport.tsx
touch pages/admin/leads/index.astro

echo "   → Jobs Manager..."
touch components/admin/jobs/JobsManager.tsx
touch components/admin/jobs/JobTable.tsx
touch components/admin/jobs/JobStats.tsx
touch components/admin/jobs/JobDetails.tsx
touch components/admin/jobs/JobActions.tsx

echo "   → Scheduler..."
touch components/admin/scheduler/SchedulerCalendar.tsx
touch components/admin/scheduler/ScheduleModal.tsx
touch components/admin/scheduler/ScheduleStats.tsx
touch components/admin/scheduler/BulkSchedule.tsx
touch pages/admin/scheduler/index.astro

# MILESTONE 3: All Collections
echo ""
echo "📦 MILESTONE 3: Creating Collection pages..."
echo "   → Content Collections..."
touch pages/admin/collections/page-blocks.astro
touch pages/admin/collections/content-fragments.astro
touch pages/admin/collections/headline-inventory.astro
touch pages/admin/collections/offer-blocks.astro
touch components/admin/collections/PageBlocksManager.tsx
touch components/admin/collections/FragmentsManager.tsx
touch components/admin/collections/HeadlinesManager.tsx
touch components/admin/collections/OffersManager.tsx

echo "   → Sites & Content..."
touch pages/admin/sites/index.astro
touch pages/admin/content/posts.astro
touch pages/admin/content/pages.astro
touch components/admin/sites/SitesManager.tsx
touch components/admin/content/PostsManager.tsx
touch components/admin/content/PagesManager.tsx
touch components/admin/content/ArticlesManager.tsx

echo "   → Campaigns & Logs..."
touch pages/admin/campaigns/index.astro
touch pages/admin/system/work-log.astro
touch components/admin/campaigns/CampaignManager.tsx
touch components/admin/system/WorkLogViewer.tsx

echo ""
echo "✅ Complete file structure created!"
echo ""
echo "📊 Summary:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   MILESTONE 1 (Intelligence Library): 25 files"
echo "   MILESTONE 2 (Factory & Forms):      20 files"
echo "   MILESTONE 3 (All Collections):      16 files"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   TOTAL:                              61 files"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start with Milestone 1 (Intelligence Library)"
echo "   2. Make all 5 Intelligence pages fully editable"
echo "   3. Add stats, Send to Engine buttons, cool UX"
echo ""
echo "🚀 Ready to implement!"
