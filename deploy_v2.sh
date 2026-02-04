#!/bin/bash

# =============================================
# Mangalam - Cloud Shell Native Deployment (v2)
# USES LOCAL DOCKER TO AVOID PERMISSION ISSUES
# =============================================

# Configuration - Updated from your error logs
export PROJECT_ID="mangalam-486305"
export REGION="asia-south1"
export BACKEND_SERVICE="mangalam-backend"
export FRONTEND_SERVICE="mangalam-frontend"

# Firebase & App Config
export FIREBASE_API_KEY="AIzaSyCMsWD6oKqPspd8NevIttBBvtm5m5yVZhg"
export FIREBASE_AUTH_DOMAIN="mangalam-71d5c.firebaseapp.com"
export FIREBASE_PROJECT_ID="mangalam-71d5c"
export FIREBASE_STORAGE_BUCKET="mangalam-71d5c.firebasestorage.app"
export FIREBASE_MESSAGING_SENDER_ID="231084447820"
export FIREBASE_APP_ID="1:231084447820:web:fb050723f1738e1d9fbce9"

# Backend Env
export MONGO_URI="mongodb+srv://rishabhrthr001_db_user:Mu84n5izmLeGyMkT@cluster0.h4prauj.mongodb.net/"
export JWT_SECRET="60255838110d05c6d90931339747203188129285cb3145f24830fbad4b1418329c472497c7cdef8f39d96568a08d4c5b078f40471fcf38a8967ba8eeeba1276d"
export CLOUDINARY_CLOUD_NAME="dpny2fb5u"
export CLOUDINARY_API_KEY="235777154686289"
export CLOUDINARY_API_SECRET="VSfudyrCoKA1VgKgv4IbeVOxLmE"

echo "============================================"
echo "Deploying Mangalam (Docker Direct Method)"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "============================================"

# Sets the project
gcloud config set project $PROJECT_ID

# Authorize Docker to push to GCR (Uses your user permissions)
echo "Configuring Docker..."
gcloud auth configure-docker --quiet

echo ""
echo "[1/6] Building Backend (Local Docker)..."
cd backend
# Build directly
docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest .
# Push directly
docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest
cd ..

echo ""
echo "[2/6] Deploying Backend..."
gcloud run deploy $BACKEND_SERVICE --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest --region $REGION --platform managed --allow-unauthenticated --memory 512Mi --set-env-vars "NODE_ENV=production,MONGO_URI=$MONGO_URI,JWT_SECRET=$JWT_SECRET,CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"

echo ""
echo "[3/6] Getting Backend URL..."
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format "value(status.url)")
echo "Backend URL: $BACKEND_URL"

echo ""
echo "[4/6] Building Frontend (Local Docker)..."
cd frontend
# Pass build args correctly using standard Docker
docker build --build-arg VITE_API_BASE_URL=$BACKEND_URL --build-arg VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY --build-arg VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN --build-arg VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID --build-arg VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID --build-arg VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest .

docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest
cd ..

echo ""
echo "[5/6] Deploying Frontend..."
gcloud run deploy $FRONTEND_SERVICE --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest --region $REGION --platform managed --allow-unauthenticated --memory 256Mi

echo ""
echo "[6/6] Syncing Configuration..."
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format "value(status.url)")
gcloud run services update $BACKEND_SERVICE --region $REGION --update-env-vars "FRONTEND_URL=$FRONTEND_URL"

echo ""
echo "============================================"
echo "Deployment Complete! 🚀"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "============================================"
