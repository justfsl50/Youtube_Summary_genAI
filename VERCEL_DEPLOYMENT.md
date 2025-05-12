# Deploying to Vercel

This guide will help you deploy your YouTube Timestamp Generator to Vercel.

## Prerequisites

1. GitHub account
2. Vercel account (sign up at [vercel.com](https://vercel.com))
3. Gemini API key

## Deployment Steps

### 1. Push Your Code to GitHub

First, create a GitHub repository and push your code:

```bash
# Initialize git repo
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add your GitHub repo as remote
git remote add origin https://github.com/yourusername/youtube-timestamp-generator.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Choose "Other"
   - Build Command: Leave as default (npm run build)
   - Output Directory: Leave as default (public)
   - Install Command: npm install

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     - Name: `GEMINI_API_KEY`
     - Value: Your Gemini API key

6. Click "Deploy"

## After Deployment

1. Once deployed, Vercel will provide you with a URL (e.g., `https://youtube-timestamp-generator.vercel.app`)

2. Visit your app and start generating timestamps and summaries!

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for errors
2. Ensure your Gemini API key is correctly set in environment variables
3. Make sure all dependencies are properly listed in package.json

## Updating Your Deployment

Any push to the connected GitHub repository will automatically trigger a new deployment on Vercel. 