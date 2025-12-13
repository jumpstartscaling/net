# Datadog Synthetics GitHub Actions - Quick Setup

## ✅ What's Been Done

The Datadog Synthetics workflow is already configured in your repository at:
`.github/workflows/datadog-synthetics.yml`

The workflow is **correctly configured** with the required `api_key` and `app_key` inputs.

## 🔑 What You Need to Do

Add two secrets to your GitHub repository:

### Step 1: Get Your Datadog Keys

1. **API Key (`DD_API_KEY`)**:
   - Go to Datadog → Organization Settings → API Keys
   - Create or copy an existing API key

2. **Application Key (`DD_APP_KEY`)**:
   - Go to Datadog → Organization Settings → Application Keys
   - Create a new application key

### Step 2: Add Secrets to GitHub

1. Go to: https://github.com/jumpstartscaling/net/settings/secrets/actions
2. Click "New repository secret"
3. Add first secret:
   - Name: `DD_API_KEY`
   - Value: [your Datadog API key]
4. Add second secret:
   - Name: `DD_APP_KEY`
   - Value: [your Datadog App key]

## ✨ That's It!

Once you add these secrets, the workflow will automatically run on:
- Every push to `main`
- Every pull request to `main`

It will run all Datadog Synthetic tests tagged with `e2e-tests`.

## 📚 More Information

See `.github/ACTIONS_SETUP.md` for detailed configuration options and troubleshooting.
