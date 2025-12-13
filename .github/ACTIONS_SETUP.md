# GitHub Actions Setup Guide

## Datadog Synthetics Integration

The repository includes a GitHub Actions workflow for running Datadog Synthetic tests on every push to `main` and on pull requests.

### Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

#### 1. DD_API_KEY
- **Purpose**: Authenticates with Datadog API
- **How to get it**:
  1. Log into your Datadog account
  2. Go to **Organization Settings** → **API Keys**
  3. Create a new API key or copy an existing one
  4. Name it something like "GitHub Actions CI"

#### 2. DD_APP_KEY
- **Purpose**: Provides application-level access to Datadog
- **How to get it**:
  1. Log into your Datadog account
  2. Go to **Organization Settings** → **Application Keys**
  3. Create a new application key
  4. Name it "GitHub Actions Synthetics"

### Adding Secrets to GitHub

1. Go to your repository on GitHub: `https://github.com/jumpstartscaling/net`
2. Click **Settings** (top right)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `DD_API_KEY`
   - Value: [paste your Datadog API key]
   - Click **Add secret**
6. Repeat for `DD_APP_KEY`

### Workflow File Location

The workflow is configured in:
```
.github/workflows/datadog-synthetics.yml
```

### What It Does

- Runs on every push to `main` branch
- Runs on every pull request to `main` branch
- Executes Datadog Synthetic tests tagged with `tag:e2e-tests`
- Fails the build if tests fail
- Reports test results in the GitHub Actions UI

### Configuring Which Tests to Run

The workflow currently runs tests with the tag `e2e-tests`. To change this:

1. Edit `.github/workflows/datadog-synthetics.yml`
2. Modify line 36: `test_search_query: 'tag:e2e-tests'`
3. Change to your preferred tag or search query

Examples:
- Run all tests: `test_search_query: '*'`
- Run specific tag: `test_search_query: 'tag:production'`
- Run by name: `test_search_query: 'name:Homepage Test'`

### Disabling the Workflow

If you don't want to use Datadog Synthetics, you can:
1. Delete the workflow file: `.github/workflows/datadog-synthetics.yml`
2. Or rename it to `.github/workflows/datadog-synthetics.yml.disabled`

### Troubleshooting

**Error: "Input required and not supplied: api_key"**
- Solution: Make sure you've added the `DD_API_KEY` secret to GitHub

**Error: "Invalid API key"**
- Solution: Verify your API key is correct in Datadog and GitHub secrets

**Tests not running**
- Check that you have Synthetic tests configured in your Datadog account
- Verify the tests are tagged with `e2e-tests` (or update the search query)
- Ensure the tests are active and not paused

**No tests found**
- Update the `test_search_query` in the workflow file to match your test tags
- Or remove the `test_search_query` line to run all tests
