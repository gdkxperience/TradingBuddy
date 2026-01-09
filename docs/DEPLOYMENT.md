# Deployment Specification

## Build Process

### Commands

```bash
npm install          # Install dependencies
npm run build        # Build for production
```

### Output

- **Directory:** `dist/`
- **Files:** 
  - `index.html`
  - `assets/` (CSS and JS bundles)
  - Optimized and minified for production

## Deployment Platform

### Primary: Vercel

**Configuration:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18.x or higher

**Configuration File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## Continuous Deployment

### Automatic Deployments

**Production:**
- **Trigger:** Push to `main` branch
- **URL:** `your-project.vercel.app`
- **Status:** Displayed in GitHub repository

**Preview:**
- **Trigger:** Pull requests
- **URL:** `your-project-git-branch-username.vercel.app`
- **Status:** Commented on PR

### Environment

- **Production:** `main` branch → `*.vercel.app`
- **Preview:** Feature branches → `*-git-*.vercel.app`

## Deployment Steps

### Initial Setup

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "Add New Project"
5. Import your repository
6. Vercel auto-detects Vite configuration
7. Click "Deploy"

### Subsequent Deployments

- Automatic on every push to `main`
- Preview deployments for pull requests
- No manual intervention required

## Build Verification

### Pre-deployment Checklist

- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All features tested locally
- [ ] Responsive design verified

### Post-deployment Verification

- [ ] Site loads correctly
- [ ] Calculations work as expected
- [ ] Both modes function properly
- [ ] Mobile responsive design works
- [ ] No console errors

## Alternative Deployment Options

### GitHub Pages

Requires additional configuration:
- Base path configuration in `vite.config.ts`
- GitHub Actions workflow for building
- Output directory setup

### Netlify

Similar to Vercel:
- Auto-detects Vite projects
- Automatic deployments from GitHub
- Similar configuration file (`netlify.toml`)

### Self-hosted

Requirements:
- Web server (nginx, Apache, etc.)
- Static file hosting
- HTTPS certificate
- Build output from `dist/` directory

---

**Last Updated:** 2025-01-27
