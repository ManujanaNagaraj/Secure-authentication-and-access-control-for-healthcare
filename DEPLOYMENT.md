# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update all dependencies to latest stable versions
- [ ] Run security audit: `npm audit`
- [ ] Fix all critical vulnerabilities
- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB connection
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Enable environment-specific logging
- [ ] Create backup strategy
- [ ] Document infrastructure

### Environment Variables

Create a production `.env` file with:

```env
# MongoDB (use MongoDB Atlas or production instance)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=use_a_very_strong_random_string_here_min_64_chars

# Server Configuration
PORT=5000
NODE_ENV=production

# Client URL (your production frontend URL)
CLIENT_URL=https://yourdomain.com

# Gemini AI API (for chatbot)
GEMINI_API_KEY=your_production_api_key
```

### Backend Deployment Options

#### Option 1: Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create healthcare-backend`
4. Set environment variables:
```bash
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=your_frontend_url
heroku config:set GEMINI_API_KEY=your_api_key
```
5. Deploy: `git push heroku main`

#### Option 2: Deploy to Railway

1. Sign up at railway.app
2. Create new project from GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

#### Option 3: Deploy to AWS EC2

1. Launch EC2 instance (Ubuntu recommended)
2. SSH into instance
3. Install Node.js and npm
4. Clone repository
5. Install dependencies: `npm install`
6. Install PM2: `npm install -g pm2`
7. Start with PM2: `pm2 start server.js --name healthcare-backend`
8. Configure nginx as reverse proxy
9. Set up SSL with Let's Encrypt

#### Option 4: Deploy to DigitalOcean

1. Create a Droplet
2. Install Node.js
3. Clone repository
4. Install dependencies
5. Use PM2 for process management
6. Configure nginx
7. Set up firewall

### Frontend Deployment Options

#### Option 1: Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory
3. Run: `vercel`
4. Follow prompts
5. Set environment variables in Vercel dashboard

#### Option 2: Deploy to Netlify

1. Build frontend: `npm run build`
2. Sign up at netlify.com
3. Drag and drop `dist` folder
4. Or connect GitHub repo for auto-deploy

#### Option 3: AWS S3 + CloudFront

1. Build frontend: `npm run build`
2. Create S3 bucket
3. Upload `dist` folder contents
4. Enable static website hosting
5. Create CloudFront distribution
6. Configure custom domain

### Database Setup

#### MongoDB Atlas (Recommended)

1. Create account at mongodb.com/cloud/atlas
2. Create cluster (M0 free tier available)
3. Configure network access (whitelist IPs or allow all)
4. Create database user
5. Get connection string
6. Update MONGO_URI in environment variables

### Post-Deployment

- [ ] Verify backend is accessible
- [ ] Verify frontend is accessible
- [ ] Test authentication flow
- [ ] Test all role-based features
- [ ] Check CORS configuration
- [ ] Monitor error logs
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Set up uptime monitoring
- [ ] Configure automated backups
- [ ] Document deployment

### Monitoring & Maintenance

#### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog
- **Uptime**: Pingdom, UptimeRobot
- **Logs**: LogDNA, Papertrail

#### Regular Maintenance

- Weekly: Check error logs
- Monthly: Review security updates
- Monthly: Check database performance
- Quarterly: Security audit
- Quarterly: Dependency updates

### SSL/HTTPS Setup

#### Using Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Scaling Considerations

#### Horizontal Scaling

- Use load balancer (AWS ALB, nginx)
- Run multiple backend instances
- Use PM2 cluster mode
- Implement session storage (Redis)

#### Database Scaling

- MongoDB replica sets
- Sharding for large datasets
- Read replicas for read-heavy workloads

### Backup Strategy

#### Database Backups

```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Automated with cron
0 2 * * * mongodump --uri="your_mongodb_uri" --out=/backup/$(date +\%Y\%m\%d)
```

#### Code Backups

- Use Git (already in place)
- Push to multiple remotes
- Tag releases: `git tag -a v1.0.0 -m "Version 1.0.0"`

### Rollback Plan

In case of issues:

1. Keep previous version deployed
2. Use git tags for version tracking
3. Quick rollback: `git revert` or redeploy previous version
4. Database migration rollback scripts

### Cost Estimation

#### Free Tier Options

- MongoDB Atlas: M0 (512MB)
- Heroku: Free dynos (limited hours)
- Vercel/Netlify: Free tier (hobby projects)
- AWS: Free tier (12 months)

#### Paid Options (Monthly estimates)

- MongoDB Atlas: M10 cluster (~$57/month)
- AWS EC2: t2.micro (~$10/month)
- DigitalOcean: Basic Droplet (~$6/month)
- Domain: ~$12/year
- SSL: Free (Let's Encrypt)

## Support

For deployment issues:
- Check application logs
- Review deployment documentation
- Contact DevOps team
- Submit issues on GitHub
