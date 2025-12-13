# Directus Configuration Settings

**Last Updated**: December 13, 2025

---

## ✅ Current Configuration

### Project Settings
- **Project Name**: Spark Platform
- **Description**: AI-Powered Content Generation & Marketing Automation
- **Project URL**: https://spark.jumpstartscaling.com
- **Project Color**: #FFD700 (Gold)
- **Default Language**: en-US
- **Project Owner**: somescreenname@gmail.com

### Visual Editor
- **Status**: ✅ Enabled
- **URLs**: 
  - https://launch.jumpstartscaling.com

**How to Use:**
1. In Directus, click "Visual" in the top module bar
2. It will load your live frontend at `https://launch.jumpstartscaling.com`
3. You can click on content to edit it inline
4. Changes save directly to Directus

### Module Bar (Enabled Modules)
1. ✅ Content - Browse and manage collections
2. ✅ Visual - Inline visual editor
3. ✅ Users - User management
4. ✅ Files - File library
5. ✅ Insights - Analytics and reporting
6. ✅ Settings - System configuration

### Security Settings
- **Auth Login Attempts**: 25
- **Auth Password Policy**: None (consider enabling for production)
- **User Registration**: Disabled
- **Registration Email Verification**: Enabled (if registration enabled)

### API Token
- **Token**: `Jlh3Ljpa3lp73W6Z3cbG_LZ3vjLYlN-H`
- **Role**: Administrator
- **Has Full Access**: Yes ✅

---

## 🔄 Flows (Automation)

**Status**: Not configured yet

### Recommended Flows to Create:

1. **Auto-Generate Article Slugs**
   - Trigger: When article is created
   - Action: Generate SEO-friendly slug from title

2. **Send Welcome Email**
   - Trigger: New lead created
   - Action: Send automated welcome email

3. **Archive Old Generated Content**
   - Trigger: Scheduled (monthly)
   - Action: Archive articles older than 6 months

4. **Notify on Campaign Completion**
   - Trigger: Campaign status = "completed"
   - Action: Send notification to admin

### How to Create Flows:
1. Go to **Settings → Flows**
2. Click **Create Flow**
3. Set trigger (Manual, Event Hook, Schedule, etc.)
4. Add operations (Read Data, Update Data, Send Email, etc.)
5. Test and enable

---

## 📊 Collections Configured

All collections have full Administrator access:

### Intelligence Library
- ✅ `avatar_intelligence` - Persona profiles
- ✅ `avatar_variants` - Gender/tone variations
- ✅ `geo_intelligence` - Location targeting
- ✅ `spintax_dictionaries` - Word variations
- ✅ `cartesian_patterns` - Content templates

### Content Engine
- ✅ `campaign_masters` - Marketing campaigns
- ✅ `content_fragments` - Reusable content blocks
- ✅ `headline_inventory` - Pre-written headlines
- ✅ `offer_blocks` - CTA templates
- ✅ `generation_jobs` - Content generation queue

### Production
- ✅ `generated_articles` - Output articles
- ✅ `leads` - Customer inquiries
- ✅ `sites` - Multi-tenant sites
- ✅ `pages` - Static pages
- ✅ `posts` - Blog posts

---

## 🛠️ Additional Settings to Configure

### Recommended Next Steps:

1. **Enable Password Policy**
   ```
   Settings → Security → Auth Password Policy
   Set to: "Strong" or custom regex
   ```

2. **Configure Email (SMTP)**
   ```
   Settings → Email (environment variables)
   EMAIL_FROM=noreply@jumpstartscaling.com
   EMAIL_TRANSPORT=smtp
   EMAIL_SMTP_HOST=smtp.sendgrid.net
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=apikey
   EMAIL_SMTP_PASSWORD=your_sendgrid_key
   ```

3. **Set Up Storage (S3 for production)**
   ```
   Settings → Files & Storage
   Use AWS S3, Cloudflare R2, or DigitalOcean Spaces
   for production file storage
   ```

4. **Configure Webhooks**
   ```
   Settings → Webhooks
   - Webhook to notify frontend when content changes
   - Integration with analytics
   - Sync to third-party services
   ```

5. **Set Up Insights**
   ```
   Settings → Insights
   Create dashboards for:
   - Content performance
   - Lead conversion rates
   - Campaign effectiveness
   ```

---

## 🔐 Security Checklist

- [x] API token using Administrator role
- [x] User registration disabled
- [ ] Strong password policy (recommended for production)
- [ ] Two-factor authentication enforced
- [ ] IP whitelist configured (optional)
- [ ] Rate limiting configured
- [ ] HTTPS enabled (✅ already using)
- [ ] Regular backups scheduled

---

## 📚 Resources

- **Directus Docs**: https://docs.directus.io
- **Flows Documentation**: https://docs.directus.io/app/flows.html
- **API Reference**: https://docs.directus.io/reference/introduction.html
- **Webhooks Guide**: https://docs.directus.io/app/webhooks.html

---

## 🎯 Quick Access URLs

- **Directus Admin**: https://spark.jumpstartscaling.com/admin
- **Visual Editor**: https://spark.jumpstartscaling.com/admin/visual
- **Access Control**: https://spark.jumpstartscaling.com/admin/settings/roles
- **Flows**: https://spark.jumpstartscaling.com/admin/settings/flows
- **Settings**: https://spark.jumpstartscaling.com/admin/settings/project

---

**Configuration Status**: ✅ Base settings configured and ready to use!
