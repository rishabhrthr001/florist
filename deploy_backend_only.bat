@echo off
REM =============================================
REM Mangalam - Backend-Only Deployment
REM =============================================

set PROJECT_ID=project-a583e1ab-ec6e-41d6-b3e
set REGION=us-central1
set REPO_NAME=mangalam-repo
set BACKEND_SERVICE=mangalam-backend
set FRONTEND_SERVICE=mangalam-frontend

REM Backend Environment Variables
set MONGO_URI=mongodb+srv://rishabhrthr001_db_user:Mu84n5izmLeGyMkT@cluster0.h4prauj.mongodb.net/
set JWT_SECRET=60255838110d05c6d90931339747203188129285cb3145f24830fbad4b1418329c472497c7cdef8f39d96568a08d4c5b078f40471fcf38a8967ba8eeeba1276d
set CLOUDINARY_CLOUD_NAME=dpny2fb5u
set CLOUDINARY_API_KEY=235777154686289
set CLOUDINARY_API_SECRET=VSfudyrCoKA1VgKgv4IbeVOxLmE

echo ============================================
echo Deploying BACKEND ONLY to: %PROJECT_ID%
echo ============================================

gcloud config set project %PROJECT_ID%

set BACKEND_IMAGE=%REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/%BACKEND_SERVICE%:latest

echo.
echo [1/3] Generating Backend Build Config...
(
    echo steps:
    echo   - name: 'gcr.io/cloud-builders/docker'
    echo     args: ['build', '-t', '%BACKEND_IMAGE%', '.']
    echo   - name: 'gcr.io/cloud-builders/docker'
    echo     args: ['push', '%BACKEND_IMAGE%']
    echo images:
    echo   - '%BACKEND_IMAGE%'
) > cloudbuild-backend.yaml

echo [2/3] Building Backend...
cd backend
gcloud builds submit --config ../cloudbuild-backend.yaml .
cd ..

echo.
echo [3/3] Deploying Backend...
gcloud run deploy %BACKEND_SERVICE% ^
  --image %BACKEND_IMAGE% ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --set-env-vars "NODE_ENV=production,MONGO_URI=%MONGO_URI%,JWT_SECRET=%JWT_SECRET%,CLOUDINARY_CLOUD_NAME=%CLOUDINARY_CLOUD_NAME%,CLOUDINARY_API_KEY=%CLOUDINARY_API_KEY%,CLOUDINARY_API_SECRET=%CLOUDINARY_API_SECRET%"

echo.
echo Resyncing Frontend URL...

for /f "tokens=*" %%i in ('gcloud run services describe %FRONTEND_SERVICE% --region %REGION% --format "value(status.url)"') do set FRONTEND_URL=%%i
echo Frontend is at: %FRONTEND_URL%

gcloud run services update %BACKEND_SERVICE% ^
  --region %REGION% ^
  --update-env-vars "FRONTEND_URL=%FRONTEND_URL%"

echo.
echo ============================================
echo Backend Updated! 🚀
echo ============================================

