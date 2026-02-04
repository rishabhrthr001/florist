# Mangalam E-commerce Platform - GCP Cloud Run Deployment Guide

## Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Docker** installed (optional, for local testing)

## Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Set your GCP project
```bash
gcloud config set project mangalam-486305
```

#### Step 2: Enable required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 3: Deploy Backend
```bash
cd backend

# Build and push
gcloud builds submit --tag gcr.io/mangalam-486305/mangalam-backend:latest .

# Deploy
gcloud run deploy mangalam-backend \
  --image gcr.io/mangalam-486305/mangalam-backend:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,MONGO_URI=your-mongo-uri,JWT_SECRET=your-secret"
```

#### Step 4: Get Backend URL
```bash
gcloud run services describe mangalam-backend --region asia-south1 --format 'value(status.url)'
```

#### Step 5: Deploy Frontend
```bash
cd frontend

# Build with backend URL
gcloud builds submit \
  --tag gcr.io/mangalam-486305/mangalam-frontend:latest \
  --build-arg VITE_API_BASE_URL=https://your-backend-url \
  .

# Deploy
gcloud run deploy mangalam-frontend \
  --image gcr.io/mangalam-486305/mangalam-frontend:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi
```

## Environment Variables

### Backend (Set in Cloud Run)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS |
| `EMAIL_USER` | Email for contact form |
| `EMAIL_PASS` | Email app password |

### Frontend (Build Arguments)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_FIREBASE_*` | Firebase configuration |

## Setting Environment Variables in Cloud Run

```bash
gcloud run services update mangalam-backend \
  --region asia-south1 \
  --set-env-vars "MONGO_URI=your-uri,JWT_SECRET=your-secret,CLOUDINARY_CLOUD_NAME=name,CLOUDINARY_API_KEY=key,CLOUDINARY_API_SECRET=secret"
```

## Custom Domain Setup

1. Go to Cloud Run Console → Select service → Domain Mappings
2. Add your custom domain
3. Update DNS records as instructed

## Monitoring

- **Logs**: `gcloud logs read --service mangalam-backend`
- **Metrics**: Cloud Run Console → Metrics tab

## Troubleshooting

### Container fails to start
- Check logs: `gcloud logs read --service mangalam-backend --limit 50`
- Verify environment variables are set correctly

### CORS errors
- Ensure `FRONTEND_URL` is set correctly on backend
- Check if frontend URL includes `https://`

### Database connection issues
- Verify MongoDB Atlas allows Cloud Run IP ranges
- Use network peering or whitelist `0.0.0.0/0` for testing

## Cost Optimization

Cloud Run only charges when handling requests:
- Set `--min-instances=0` for automatic scaling to zero
- Use `--max-instances=10` to limit costs
- Monitor usage in Cloud Console

## Estimated Costs (asia-south1)
- First 2 million requests/month: FREE
- Memory: ~$0.00002400/GiB-second
- CPU: ~$0.00002400/vCPU-second

For typical low-traffic e-commerce: **$0-5/month**
