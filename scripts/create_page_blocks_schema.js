#!/usr/bin/env node
/**
 * Create page_blocks collection schema in Directus
 * Stores Craft.js block configurations for visual page builder
 */

const DIRECTUS_URL = 'https://spark.jumpstartscaling.com';
const TOKEN = 'Jlh3Ljpa3lp73W6Z3cbG_LZ3vjLYlN-H';

async function createSchema() {
    console.log('🔧 Creating page_blocks collection schema...\n');

    try {
        // 1. Create the collection
        console.log('📦 Creating page_blocks collection...');
        const collectionResponse = await fetch(`${DIRECTUS_URL}/collections`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collection: 'page_blocks',
                meta: {
                    collection: 'page_blocks',
                    icon: 'view_agenda',
                    note: 'Visual page builder block configurations',
                    display_template: '{{block_type}} - {{page_id}}',
                    hidden: false,
                    singleton: false,
                    translations: null,
                    archive_field: null,
                    archive_app_filter: true,
                    archive_value: null,
                    unarchive_value: null,
                    sort_field: 'order',
                    accountability: 'all',
                    color: '#6644FF',
                    item_duplication_fields: null,
                    sort: 1,
                    group: null,
                    collapse: 'open'
                },
                schema: {
                    name: 'page_blocks'
                }
            })
        });

        if (!collectionResponse.ok) {
            const error = await collectionResponse.text();
            console.log('⚠️  Collection may already exist:', error.substring(0, 100));
        } else {
            console.log('✅ Collection created!');
        }

        // 2. Create fields
        const fields = [
            {
                field: 'id',
                type: 'uuid',
                meta: {
                    hidden: true,
                    readonly: true,
                    interface: 'input',
                    special: ['uuid'],
                    note: 'Primary key'
                },
                schema: {
                    is_primary_key: true,
                    has_auto_increment: false,
                    is_nullable: false
                }
            },
            {
                field: 'page_id',
                type: 'uuid',
                meta: {
                    interface: 'select-dropdown-m2o',
                    special: ['m2o'],
                    required: true,
                    options: {
                        template: '{{title}}'
                    },
                    display: 'related-values',
                    display_options: {
                        template: '{{title}}'
                    },
                    width: 'half',
                    note: 'Page this block belongs to'
                },
                schema: {
                    is_nullable: false,
                    foreign_key_table: 'pages',
                    foreign_key_column: 'id'
                }
            },
            {
                field: 'order',
                type: 'integer',
                meta: {
                    interface: 'input',
                    required: true,
                    width: 'half',
                    note: 'Display order (0-based)',
                    options: {
                        min: 0
                    }
                },
                schema: {
                    is_nullable: false,
                    default_value: 0
                }
            },
            {
                field: 'block_type',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    required: true,
                    width: 'half',
                    note: 'Type of content block',
                    options: {
                        choices: [
                            { text: 'Hero', value: 'hero' },
                            { text: 'Features', value: 'features' },
                            { text: 'FAQ', value: 'faq' },
                            { text: 'Rich Text', value: 'richtext' },
                            { text: 'Image', value: 'image' },
                            { text: 'CTA', value: 'cta' },
                            { text: 'Testimonial', value: 'testimonial' },
                            { text: 'Pricing', value: 'pricing' },
                            { text: 'Stats', value: 'stats' },
                            { text: 'Offer Block', value: 'offer' }
                        ]
                    }
                },
                schema: {
                    is_nullable: false,
                    max_length: 50
                }
            },
            {
                field: 'block_config',
                type: 'json',
                meta: {
                    interface: 'input-code',
                    required: true,
                    options: {
                        language: 'json',
                        template: '{}'
                    },
                    note: 'Block configuration and props (JSON)',
                    width: 'full'
                },
                schema: {
                    is_nullable: false
                }
            },
            {
                field: 'created_at',
                type: 'timestamp',
                meta: {
                    interface: 'datetime',
                    readonly: true,
                    hidden: true,
                    special: ['date-created'],
                    width: 'half'
                },
                schema: {
                    is_nullable: false
                }
            },
            {
                field: 'updated_at',
                type: 'timestamp',
                meta: {
                    interface: 'datetime',
                    readonly: true,
                    hidden: true,
                    special: ['date-updated'],
                    width: 'half'
                },
                schema: {
                    is_nullable: true
                }
            }
        ];

        for (const field of fields) {
            console.log(`📝 Creating field: ${field.field}...`);
            const fieldResponse = await fetch(`${DIRECTUS_URL}/fields/page_blocks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(field)
            });

            if (!fieldResponse.ok) {
                const error = await fieldResponse.text();
                console.log(`   ⚠️  May already exist: ${error.substring(0, 80)}`);
            } else {
                console.log(`   ✅ Created ${field.field}`);
            }
        }

        // 3. Create the relation
        console.log('\n🔗 Creating page_blocks → pages relation...');
        const relationResponse = await fetch(`${DIRECTUS_URL}/relations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                collection: 'page_blocks',
                field: 'page_id',
                related_collection: 'pages',
                meta: {
                    one_field: 'blocks',
                    sort_field: 'order',
                    one_deselect_action: 'nullify'
                },
                schema: {
                    on_delete: 'CASCADE'
                }
            })
        });

        if (!relationResponse.ok) {
            const error = await relationResponse.text();
            console.log('⚠️  Relation may exist:', error.substring(0, 100));
        } else {
            console.log('✅ Relation created!');
        }

        console.log('\n🎉 Schema creation complete!\n');
        console.log('📊 Collection: page_blocks');
        console.log('🔗 Relation: page_blocks.page_id → pages.id (M2O)');
        console.log('\n✅ You can now use the visual block editor!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSchema();
