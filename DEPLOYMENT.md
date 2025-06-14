# 🚀 MovieApp Deployment Guide

This guide provides comprehensive instructions for deploying the MovieApp fullstack application to production using Vercel (frontend) and Render (backend).

## 📋 Prerequisites

Before deploying, ensure you have:

- GitHub repository with your MovieApp code
- Vercel account ([vercel.com](https://vercel.com))
- Render account ([render.com](https://render.com))
- TMDB API key ([themoviedb.org](https://www.themoviedb.org/settings/api))

## 🎯 Deployment Architecture

```
Frontend (React) → Vercel
Backend (Express) → Render
Database (PostgreSQL) → Render PostgreSQL
```

## 🗄️ Database Deployment (Render PostgreSQL)

### Step 1: Create PostgreSQL Database

1. **Login to Render Dashboard**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   ```
   Name: movieapp-db
   Database: movieapp
   User: movieapp_user
   Region: Choose closest to your users
   Plan: Free (or paid for production)
   ```

3. **Save Connection Details**
   - Copy the "External Database URL" after creation
   - Format: `postgresql://user:password@hostname:port/database`

### Step 2: Initialize Database Schema

1. **Set Environment Variable**
   ```bash
   export DATABASE_URL="your_postgresql_connection_string"
   ```

2. **Push Database Schema**
   ```bash
   npm run db:push
   ```

## 🖥️ Backend Deployment (Render)

### Step 1: Create Web Service

1. **Connect Repository**
   - In Render Dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your MovieApp

2. **Configure Service Settings**
   ```
   Name: movieapp-backend
   Environment: Node
   Build Command: npm ci && npm run build
   Start Command: npm start
   ```

### Step 2: Environment Variables

Add these environment variables in Render:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=[Use your PostgreSQL connection string]
TMDB_API_KEY=[Your TMDB API key]
JWT_SECRET=[Generate a secure random string]
FRONTEND_URL=https://your-app-name.vercel.app
```

### Step 3: Deploy Backend

1. **Trigger Deployment**
   - Click "Create Web Service"
   - Wait for build and deployment to complete
   - Note the service URL (e.g., `https://movieapp-backend.onrender.com`)

2. **Verify Health Check**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production","version":"1.0.0"}`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Configuration

1. **Create Vercel Configuration**
   
   The `vercel.json` file is already configured in your project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "client/**/*",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: client/dist
   Install Command: npm ci
   ```

3. **Environment Variables**
   
   Add these in Vercel dashboard:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Note the deployment URL (e.g., `https://movieapp.vercel.app`)

### Step 3: Update Backend CORS

1. **Update Backend Environment**
   - In Render backend service, update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://your-actual-vercel-url.vercel.app
   ```

2. **Redeploy Backend**
   - Trigger a new deployment in Render
   - This ensures CORS allows your frontend domain

## 🔄 CI/CD Pipeline Setup

### GitHub Actions Configuration

The `.github/workflows/deploy.yml` file is configured for automatic deployments:

1. **Required Secrets in GitHub**
   
   Add these secrets in your GitHub repository settings:
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id
   RENDER_SERVICE_ID=your_render_service_id
   RENDER_API_KEY=your_render_api_key
   ```

2. **Automatic Deployment Triggers**
   - Push to `main` branch triggers production deployment
   - Pull requests trigger preview deployments

### Vercel Integration

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Get Project Details**
   ```bash
   vercel project ls
   ```

### Render Webhooks

1. **Get Service ID**
   - In Render dashboard, go to your service
   - Copy the Service ID from the URL

2. **Generate API Key**
   - Go to Account Settings → API Keys
   - Create new API key

## 🔍 Testing Deployment

### Backend Testing

1. **Health Check**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

2. **CORS Test**
   ```bash
   curl -H "Origin: https://your-frontend-url.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS \
        https://your-backend-url.onrender.com/api/auth/login
   ```

### Frontend Testing

1. **Access Application**
   - Visit your Vercel URL
   - Test user registration and login
   - Verify movie search functionality
   - Check profile and watchlist features

2. **Console Verification**
   - Open browser dev tools
   - Check for CORS errors
   - Verify API calls to backend

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `FRONTEND_URL` in backend environment
   - Check Render service logs
   - Ensure both services are deployed

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Check PostgreSQL service status
   - Run `npm run db:push` if needed

3. **Environment Variables**
   - Double-check all required variables
   - Ensure no trailing spaces
   - Verify TMDB API key validity

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs for specific errors

### Debugging Commands

```bash
# Check backend logs
curl https://your-backend-url.onrender.com/api/health

# Test database connection
npm run db:push

# Verify frontend build
npm run build

# Check TMDB API
curl "https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY"
```

## 📊 Monitoring & Maintenance

### Performance Monitoring

1. **Render Metrics**
   - Monitor CPU and memory usage
   - Check response times
   - Review error logs

2. **Vercel Analytics**
   - Track page load times
   - Monitor Core Web Vitals
   - Analyze user behavior

### Updates & Maintenance

1. **Dependency Updates**
   ```bash
   npm update
   npm audit fix
   ```

2. **Database Maintenance**
   - Regular backups via Render
   - Monitor database size
   - Optimize queries as needed

3. **Security Updates**
   - Rotate JWT secrets periodically
   - Update API keys if compromised
   - Review access logs

## 🎉 Success Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Vercel with correct API URL
- [ ] CORS configured properly between frontend and backend
- [ ] Health check endpoint returning 200 status
- [ ] User registration and login working
- [ ] Movie search functionality operational
- [ ] Profile and watchlist features accessible
- [ ] CI/CD pipeline configured and tested

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **TMDB API Docs**: [developers.themoviedb.org](https://developers.themoviedb.org)

Your MovieApp is now ready for production use with professional deployment infrastructure!