# GitHub Pages Deployment Setup

This guide walks you through setting up GitHub Pages deployment for the Rive Tester app.

## Prerequisites

- GitHub repository with the Rive Tester code
- GitHub Pages enabled for your repository
- Node.js and npm installed locally (for testing)

## Step 1: Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

## Step 2: Repository Setup

The deployment workflow is already configured in `.github/workflows/deploy-rive-tester.yml`. This workflow will:

- ✅ Automatically trigger on pushes to main/master branch
- ✅ Install dependencies including Rive runtime
- ✅ Copy all necessary files to deployment directory
- ✅ Create a landing page with links to tools
- ✅ Deploy to GitHub Pages

## Step 3: Test Locally Before Deployment

Before pushing to GitHub, test the deployment structure locally:

```bash
# Run the deployment test script
npm run test-deployment

# Start a local server to test
cd _test-deployment
npx http-server -p 8080

# Open http://localhost:8080 in your browser
```

This creates a local copy of exactly what will be deployed to GitHub Pages.

## Step 4: Deploy

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **Monitor the deployment:**
   - Go to your repository on GitHub
   - Click the **Actions** tab
   - Watch the "Deploy Rive Tester to GitHub Pages" workflow
   - Deployment typically takes 2-3 minutes

3. **Access your deployed app:**
   - Your app will be available at: `https://[username].github.io/[repository-name]/rive-tester/`
   - The landing page will be at: `https://[username].github.io/[repository-name]/`

## Expected URL Structure

Based on your existing CEP documentation setup, the URLs will be:

- **Landing Page**: `https://ivg-design.github.io/rive-tester/`
- **Rive Tester App**: `https://ivg-design.github.io/rive-tester/rive-tester/`
- **CEP Documentation**: `https://ivg-design.github.io/cep/` (existing)

## Deployment Structure

```
GitHub Pages Root
├── index.html                 # Landing page with tool links
└── rive-tester/              # Rive Tester application
    ├── index.html            # Main app interface
    ├── style.css             # App styling
    ├── src/                  # Source modules
    │   ├── parser.js
    │   ├── riveControlInterface.js
    │   ├── dataToControlConnector.js
    │   └── utils/
    ├── node_modules/         # Dependencies (Rive runtime, etc.)
    ├── *.riv                 # Sample Rive files
    └── README.md             # Documentation
```

## Troubleshooting

### Deployment Fails

1. **Check the Actions log:**
   - Go to repository → Actions → Failed workflow
   - Click on the failed job to see error details

2. **Common issues:**
   - Missing dependencies in package.json
   - File path issues (ensure all paths are relative)
   - Large file sizes (GitHub has limits)

### App Doesn't Load

1. **Check browser console for errors**
2. **Verify all dependencies are included:**
   - Rive runtime should be in node_modules
   - JSONEditor should be available
   - All source files should be present

3. **Test locally first:**
   ```bash
   npm run test-deployment
   cd _test-deployment
   npx http-server -p 8080
   ```

### File Upload Issues

- GitHub Pages serves static files only
- File uploads work through browser File API
- No server-side processing available

## Updating the Deployment

To update the deployed version:

1. Make changes locally
2. Test with `npm run test-deployment`
3. Commit and push to main branch
4. GitHub Actions will automatically redeploy

## Integration with Existing CEP Documentation

The deployment creates a unified landing page that links to both:
- Your new Rive Tester app
- Your existing CEP documentation site

This provides a single entry point for all your development tools.

## Security Considerations

- All code runs client-side in the browser
- No sensitive data should be included in the repository
- File uploads are processed locally in the browser
- No server-side data storage or processing

## Performance Optimization

The deployment includes:
- ✅ Production-only npm dependencies
- ✅ Minified CSS and JS where possible
- ✅ Efficient file structure
- ✅ Static file serving from GitHub's CDN

## Monitoring and Analytics

Consider adding:
- Google Analytics for usage tracking
- Error monitoring (e.g., Sentry)
- Performance monitoring

Add these to the HTML files if needed for production use. 