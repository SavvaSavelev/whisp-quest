# 🌐 GitHub Pages Setup Instructions

## Automatic Setup (Recommended)

1. **Run the Pages Setup Workflow:**
   - Go to your repository on GitHub
   - Click on "Actions" tab
   - Find "📄 GitHub Pages Setup" workflow
   - Click "Run workflow" button
   - This will automatically enable Pages and deploy your site

## Manual Setup (If automatic fails)

1. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Scroll down to "Pages" section in the left sidebar
   - Under "Source", select **"GitHub Actions"**
   - Click "Save"

2. **Verify Setup:**
   - Go to Actions tab
   - Your deploy workflow should now run successfully
   - Your site will be available at: `https://yourusername.github.io/whisp-quest`

## Troubleshooting

### Error: "Get Pages site failed"
- This means Pages isn't enabled yet
- Follow the manual setup steps above
- Re-run the deploy workflow

### Error: "Not Found"
- Check repository permissions
- Ensure the repository is public (or you have GitHub Pro for private Pages)
- Verify the workflow has proper permissions

### Build Issues
- Check the build logs in Actions tab
- Ensure `npm run build` works locally
- Verify `dist/` folder contains `index.html`

## What Gets Deployed

- The `dist/` folder from your Vite build
- Contains your optimized React application
- Includes all assets, styles, and JavaScript bundles
- Automatically updated on every push to `master` branch

## URLs

- **Production Site:** `https://yourusername.github.io/whisp-quest`
- **GitHub Actions:** Repository → Actions tab
- **Settings:** Repository → Settings → Pages
