# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `androama-web` (or your preferred name)
3. Description: "ANDROAMA Web Platform - Professional Android Device Management"
4. Choose **Private** (recommended) or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "D:\projekti\bolt androama\project"

# Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Push

1. Go to your GitHub repository page
2. Verify all files are there
3. Check that `.env` and `*.db` files are NOT in the repository (they should be ignored)

## Step 4: Set Up GitHub Actions (Optional - for CI/CD)

You can create `.github/workflows/deploy.yml` for automatic deployment, but manual deployment is fine for now.

## Important Notes

- **Never commit `.env` files** - They contain secrets
- **Never commit database files** - They're in `.gitignore`
- **Always pull before making changes** on VPS: `git pull origin main`
- **Test locally** before pushing to production

## Next Steps

After pushing to GitHub, follow the deployment instructions in `DEPLOYMENT.md` or `QUICK_DEPLOY.md` to deploy to your VPS.

