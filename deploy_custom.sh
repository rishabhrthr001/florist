#!/bin/bash

# =============================================
# Mangalam - Custom Project Deployment (v7)
# PROJECT: project-a583e1ab-ec6e-41d6-b3e
# FIXES: Grants permissions to BOTH Service Accounts
# =============================================

# Configuration
export PROJECT_ID="project-a583e1ab-ec6e-41d6-b3e"
export REGION="us-central1"
export REPO_NAME="mangalam-repo"
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
echo "Deploying Mangalam to: $PROJECT_ID"
echo "Region: $REGION"
echo "============================================"

gcloud config set project $PROJECT_ID

echo ""
echo "[1/8] Fixing Permissions (Universal)..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"

# 1. Try Cloud Build SA
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/storage.admin" || echo "Note: Could not set Cloud Build SA (might not exist yet)"

# 2. Try Compute SA (Often used as fallback)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/storage.admin" || echo "Note: Could not set Compute SA"

# 3. Try Compute SA (Artifact Registry)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/artifactregistry.writer" || echo "Note: Could not set Compute SA (AR)"

echo ""
echo "[2/8] Ensuring Artifact Registry Repo..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Mangalam Repo" \
    || echo "Repo likely already exists"

# Define Image Paths
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$BACKEND_SERVICE:latest"
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$FRONTEND_SERVICE:latest"

echo ""
echo "[3/8] Generating Backend Build Config..."
cat > cloudbuild-backend.yaml <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', '$BACKEND_IMAGE', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '$BACKEND_IMAGE']
images:
  - '$BACKEND_IMAGE'
EOF

echo "[4/8] Building Backend (Cloud Side)..."
cd backend
gcloud builds submit --config ../cloudbuild-backend.yaml .
cd ..

echo ""
echo "[5/8] Deploying Backend..."
gcloud run deploy $BACKEND_SERVICE \
  --image $BACKEND_IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,MONGO_URI=$MONGO_URI,JWT_SECRET=$JWT_SECRET,CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"

echo ""
echo "[6/8] Getting Backend URL..."
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format "value(status.url)")
echo "Backend URL: $BACKEND_URL"

echo ""
echo "[7/8] Generating Frontend Build Config..."
cat > cloudbuild-frontend.yaml <<EOF
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'build'
      - '--build-arg'
      - 'VITE_API_BASE_URL=$BACKEND_URL'
      - '--build-arg'
      - 'VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY'
      - '--build-arg'
      - 'VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN'
      - '--build-arg'
      - 'VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID'
      - '--build-arg'
      - 'VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET'
      - '--build-arg'
      - 'VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID'
      - '--build-arg'
      - 'VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID'
      - '-t'
      - '$FRONTEND_IMAGE'
      - '.'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '$FRONTEND_IMAGE']
images:
  - '$FRONTEND_IMAGE'
EOF

echo "[8/8] Building Frontend (Cloud Side)..."
cd frontend
gcloud builds submit --config ../cloudbuild-frontend.yaml .
cd ..

echo ""
echo "[9/9] Deploying Frontend..."
gcloud run deploy $FRONTEND_SERVICE \
  --image $FRONTEND_IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi

echo ""
echo "[10/9] Syncing Configuration..."
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format "value(status.url)")
gcloud run services update $BACKEND_SERVICE \
  --region $REGION \
  --update-env-vars "FRONTEND_URL=$FRONTEND_URL"

echo ""
echo "============================================"
echo "Deployment Complete! 🚀"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "============================================"
