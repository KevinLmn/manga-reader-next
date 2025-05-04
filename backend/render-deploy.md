# Deploying MangaDB Backend to Render.com

This guide will help you deploy your MangaDB backend to Render.com.

## Prerequisites

1. Create a [Render.com](https://render.com) account if you don't already have one.
2. Ensure your repository is hosted on GitHub or GitLab.

## Deployment Steps

### Option 1: Using the render.yaml Blueprint (Recommended)

1. Fork or push your repository to GitHub or GitLab.
2. Log in to Render.com and go to your dashboard.
3. Click the "New" button and select "Blueprint".
4. Connect your GitHub or GitLab account if you haven't already.
5. Select your manga-back repository.
6. Render will automatically detect the `render.yaml` file and set up your services.
7. Review the settings and click "Apply".
8. Enter your secret environment variables:
   - `JWT_SECRET`: Your secure JWT token secret
   - `NEXT_PUBLIC_FRONT_END_URL`: Your frontend application URL

### Option 2: Manual Setup

#### Web Service Setup

1. Log in to Render.com and go to your dashboard.
2. Click the "New" button and select "Web Service".
3. Connect your GitHub or GitLab repository.
4. Configure the service:
   - **Name**: manga-db-api
   - **Environment**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free or Starter
   - **Advanced**: Add the following environment variables:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `JWT_SECRET`: Your secure JWT token secret
     - `MANGADEX_BASE_URL`: https://api.mangadex.org
     - `NEXT_PUBLIC_FRONT_END_URL`: Your frontend application URL
5. Click "Create Web Service".

#### Database Setup

1. In your Render dashboard, click the "New" button and select "PostgreSQL".
2. Configure the database:
   - **Name**: manga-db
   - **Database**: manga
   - **User**: manga
   - **Plan**: Free or Starter
3. Click "Create Database".
4. Once created, find the "Internal Connection String" in the database dashboard.
5. Go to your web service's environment variables and add:
   - `DATABASE_URL`: The internal connection string from your database

## Configuring CORS for Render

Update your backend code to ensure CORS is properly configured for your Render deployment:

```typescript
app.register(cors, {
  origin: process.env.NEXT_PUBLIC_FRONT_END_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400,
})
```

## Monitoring and Maintenance

- **View Logs**: Go to your web service dashboard and click on "Logs"
- **Restart Service**: Click the "Manual Deploy" button and select "Clear Cache and Deploy"
- **Update Config**: Go to "Environment" to update your environment variables
- **Scale Up**: Upgrade your plan in the "Settings" section if needed

## Continuous Deployment

Render automatically deploys your application when you push changes to your repository's main branch. To disable this:

1. Go to your web service settings
2. Scroll down to "Auto-Deploy"
3. Select "No" and save changes

## Free Tier Limitations

The free tier on Render includes:

- Web services spin down after 15 minutes of inactivity
- 512 MB of memory
- 750 hours of runtime per month
- PostgreSQL databases limited to 1GB storage

For production use, consider upgrading to a paid plan.
