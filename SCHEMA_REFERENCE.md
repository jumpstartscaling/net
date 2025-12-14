# Spark Platform - Database Schema Reference

This document serves as the **Single Source of Truth** for the Spark Platform database schema. It consolidates all core systems, engines, and analytics modules.

## 1. Core System

### `sites`
Managed WordPress instances.
- **id** (UUID): Primary Key
- **name** (String): Site Name
- **url** (String): Full URL (e.g., https://example.com)
- **wp_username** (String): Admin username
- **wp_app_password** (String): Application Password
- **domain_age_years** (Integer): Age of domain for velocity calculation
- **status** (String): `active` | `paused` | `archived`
- **created_at** (Timestamp)
- **updated_at** (Timestamp)

### `globals`
Site-wide settings and branding.
- **id** (UUID): Primary Key
- **site** (M2O -> sites): Owner site
- **site_name** (String)
- **site_tagline** (String)
- **logo** (Image)
- **favicon** (Image)
- **primary_color** (String)
- **secondary_color** (String)
- **footer_text** (Text)
- **social_links** (JSON)
- **scripts_head** (Text)
- **scripts_body** (Text)

### `navigation`
Site menus.
- **id** (UUID)
- **site** (M2O -> sites)
- **label** (String)
- **url** (String)
- **target** (String): `_self` | `_blank`
- **parent** (M2O -> navigation): For nested menus
- **sort** (Integer)

---

## 2. Content Factory (SEO Engine)

### `campaign_masters`
Controls content generation campaigns.
- **id** (UUID)
- **site_id** (M2O -> sites)
- **name** (String)
- **headline_spintax_root** (Text): Root spintax for titles
- **niche_variables** (JSON): Key/Value pairs for replacement
- **location_mode** (String): `none` | `state` | `county` | `city`
- **location_target** (String)
- **batch_count** (Integer)
- **target_word_count** (Integer): Default 1500
- **velocity_mode** (String): `RAMP_UP` | `CONSISTENT`
- **backdate_start** (Date)
- **backdate_end** (Date)
- **status** (String): `active` | `paused` | `completed`

### `generated_articles`
The central content unit (replaces/aliases `posts` for SEO).
- **id** (UUID)
- **site_id** (M2O -> sites)
- **campaign_id** (M2O -> campaign_masters)
- **title** (String)
- **slug** (String)
- **html_content** (Text): Full rendered HTML
- **schema_json** (JSON): FAQ, Article, Product schema
- **meta_desc** (Text)
- **meta_title** (String)
- **featured_image** (Image)
- **generation_hash** (String): For duplicate checks
- **is_published** (Boolean)
- **status** (String): `queued` | `processing` | `qc` | `approved` | `published`
- **sitemap_status** (String): `ghost` | `queued` | `indexed`
- **date_created** (Timestamp)
- **date_published** (Timestamp)

### `headline_inventory`
Pre-generated titles awaiting content.
- **id** (UUID)
- **campaign** (M2O -> campaign_masters)
- **final_title_text** (String)
- **status** (String): `available` | `used`
- **used_on_article** (M2O -> generated_articles)

### `content_fragments`
Reusable content blocks (intros, outros, CTAs).
- **id** (UUID)
- **campaign** (M2O -> campaign_masters)
- **fragment_type** (String)
- **content_body** (Text)
- **word_count** (Integer)

### `production_queue`
Manages generation schedule and velocity.
- **id** (UUID)
- **site** (M2O -> sites)
- **campaign** (M2O -> campaign_masters)
- **status** (String): `test_batch` | `pending` | `active` | `completed`
- **total_requested** (Integer)
- **completed_count** (Integer)
- **velocity_mode** (String)
- **schedule_data** (JSON): Array of planned dates

---

## 3. Cartesian Engine (Advanced Logic)

### `generation_jobs`
Batch jobs for Cartesian product generation.
- **id** (UUID)
- **site_id** (M2O -> sites)
- **target_quantity** (Integer)
- **status** (String): `Pending` | `Processing` | `Complete`
- **filters** (JSON)
- **current_offset** (Integer)

### `cartesian_patterns`
Logic patterns for data combinations.
- **id** (UUID)
- **pattern_key** (String): Unique key
- **pattern_type** (String)
- **formula** (String): Logic formula
- **data** (JSON)

### `spintax_dictionaries`
Global spintax terms.
- **id** (UUID)
- **category** (String): e.g., "power_words"
- **data** (JSON): Array of strings

---

## 4. Intelligence Library

### `avatar_intelligence`
User personas for targeted content.
- **id** (UUID)
- **avatar_key** (String)
- **base_name** (String)
- **wealth_cluster** (String)
- **business_niches** (JSON)
- **data** (JSON): Pain points, desires, etc.

### `avatar_variants`
Variations of personas.
- **id** (UUID)
- **avatar_key** (String)
- **variant_type** (String)
- **data** (JSON)

### `geo_intelligence`
Location data clusters.
- **id** (UUID)
- **cluster_key** (String)
- **data** (JSON): Demographics, local keywords

### `offer_blocks`
Universal and personalized offer content.
- **id** (UUID)
- **block_type** (String)
- **avatar_key** (String)
- **data** (JSON)

### `quality_flags`
Content quality control issues.
- **id** (UUID)
- **site** (M2O -> sites)
- **batch_id** (String)
- **article_a** (String)
- **article_b** (String)
- **collision_text** (Text)
- **similarity_score** (Float)
- **status** (String): `pending` | `resolved` | `ignored`

---

## 5. Analytics & Tracking

### `events`
Custom user interactions.
- **id** (UUID)
- **site** (M2O -> sites)
- **event_name** (String)
- **event_category** (String)
- **event_label** (String)
- **event_value** (Integer)
- **page_path** (String)
- **session_id** (String)
- **visitor_id** (String)
- **metadata** (JSON)
- **timestamp** (Timestamp)

### `pageviews`
Traffic logging.
- **id** (UUID)
- **site** (M2O -> sites)
- **page_path** (String)
- **page_title** (String)
- **referrer** (String)
- **user_agent** (String)
- **ip_address** (String)
- **device_type** (String)
- **browser** (String)
- **os** (String)
- **utm_source** (String)
- **utm_medium** (String)
- **utm_campaign** (String)
- **is_bot** (Boolean)
- **bot_name** (String)
- **timestamp** (Timestamp)

### `conversions`
Goal completions.
- **id** (UUID)
- **site** (M2O -> sites)
- **lead** (M2O -> leads)
- **conversion_type** (String)
- **value** (Float)
- **currency** (String)
- **source** (String)
- **sent_to_google** (Boolean)
- **sent_to_facebook** (Boolean)

### `site_analytics`
Analytics configuration per site.
- **id** (UUID)
- **site** (M2O -> sites)
- **google_ads_id** (String)
- **google_ads_conversion_label** (String)
- **fb_pixel_id** (String)
- **fb_access_token** (String)

---

## 6. Infrastructure

### `hub_pages`
Programmatic internal linking hubs.
- **id** (UUID)
- **site** (M2O -> sites)
- **title** (String)
- **slug** (String)
- **parent_hub** (M2O -> hub_pages)
- **level** (Integer)
- **articles_count** (Integer)
- **schema_json** (JSON)

### `link_targets`
Internal linking destinations.
- **id** (UUID)
- **site** (M2O -> sites)
- **target_url** (String)
- **anchor_text** (String)
- **anchor_variations** (JSON)
- **priority** (Integer)
- **is_active** (Boolean)
- **is_hub** (Boolean)

### `work_log`
System audit trail.
- **id** (UUID)
- **site** (M2O -> sites)
- **action** (String)
- **entity_type** (String)
- **entity_id** (String)
- **details** (JSON)
- **user** (String)
- **timestamp** (Timestamp)
