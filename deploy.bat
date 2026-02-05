@echo off
REM =============================================
REM Mangalam - GCP Cloud Run Deployment Script
REM =============================================

set PROJECT_ID=mangalam-71d5c
set REGION=asia-south1
set BACKEND_SERVICE=mangalam-backend
set FRONTEND_SERVICE=mangalam-frontend

REM Firebase Configuration
set FIREBASE_API_KEY=AIzaSyCMsWD6oKqPspd8NevIttBBvtm5m5yVZhg
set FIREBASE_AUTH_DOMAIN=mangalam-71d5c.firebaseapp.com
set FIREBASE_PROJECT_ID=mangalam-71d5c
set FIREBASE_STORAGE_BUCKET=mangalam-71d5c.firebasestorage.app
set FIREBASE_MESSAGING_SENDER_ID=231084447820
set FIREBASE_APP_ID=1:231084447820:web:fb050723f1738e1d9fbce9

REM Backend Environment Variables
set MONGO_URI=mongodb+srv://rishabhrthr001_db_user:Mu84n5izmLeGyMkT@cluster0.h4prauj.mongodb.net/
set JWT_SECRET=60255838110d05c6d90931339747203188129285cb3145f24830fbad4b1418329c472497c7cdef8f39d96568a08d4c5b078f40471fcf38a8967ba8eeeba1276d
set CLOUDINARY_CLOUD_NAME=dpny2fb5u
set CLOUDINARY_API_KEY=235777154686289
set CLOUDINARY_API_SECRET=VSfudyrCoKA1VgKgv4IbeVOxLmE

echo ============================================
echo Deploying Mangalam to GCP Cloud Run
echo Project: %PROJECT_ID%
echo Region: %REGION%
echo ============================================

REM Set the project
gcloud config set project %PROJECT_ID%

echo.
echo [1/6] Building Backend Docker Image...
cd backend
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%BACKEND_SERVICE%:latest .

echo.
echo [2/6] Deploying Backend to Cloud Run...
gcloud run deploy %BACKEND_SERVICE% ^
  --image gcr.io/%PROJECT_ID%/%BACKEND_SERVICE%:latest ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --set-env-vars "NODE_ENV=production,MONGO_URI=%MONGO_URI%,JWT_SECRET=%JWT_SECRET%,CLOUDINARY_CLOUD_NAME=%CLOUDINARY_CLOUD_NAME%,CLOUDINARY_API_KEY=%CLOUDINARY_API_KEY%,CLOUDINARY_API_SECRET=%CLOUDINARY_API_SECRET%"

echo.
echo [3/6] Getting Backend URL...
for /f "tokens=*" %%i in ('gcloud run services describe %BACKEND_SERVICE% --region %REGION% --format "value(status.url)"') do set BACKEND_URL=%%i
echo Backend URL: %BACKEND_URL%

cd ..

echo.
echo [4/6] Building Frontend Docker Image...
cd frontend
gcloud builds submit ^
  --tag gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE%:latest ^
  --substitutions=_VITE_API_BASE_URL=%BACKEND_URL%,_VITE_FIREBASE_API_KEY=%FIREBASE_API_KEY%,_VITE_FIREBASE_AUTH_DOMAIN=%FIREBASE_AUTH_DOMAIN%,_VITE_FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID%,_VITE_FIREBASE_STORAGE_BUCKET=%FIREBASE_STORAGE_BUCKET%,_VITE_FIREBASE_MESSAGING_SENDER_ID=%FIREBASE_MESSAGING_SENDER_ID%,_VITE_FIREBASE_APP_ID=%FIREBASE_APP_ID% ^
  .

echo.
echo [5/6] Deploying Frontend to Cloud Run...
gcloud run deploy %FRONTEND_SERVICE% ^
  --image gcr.io/%PROJECT_ID%/%FRONTEND_SERVICE%:latest ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --memory 256Mi

echo.
echo [6/6] Updating Backend CORS with Frontend URL...
for /f "tokens=*" %%i in ('gcloud run services describe %FRONTEND_SERVICE% --region %REGION% --format "value(status.url)"') do set FRONTEND_URL=%%i

gcloud run services update %BACKEND_SERVICE% ^
  --region %REGION% ^
  --update-env-vars "FRONTEND_URL=%FRONTEND_URL%"

cd ..

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo ============================================

pause
