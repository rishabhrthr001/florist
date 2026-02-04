# 🚨 CRITICAL AUTHENTICATION REQUIRED

Your Google Cloud deployment is currently blocked because your **Quotas** are being checked against an unauthorized or mismatching project.

This error: `WARNING: Your active project does not match the quota project`

## ✅ THE FIX (Do this once)

Run the following command in your terminal. It will open a browser window. **You MUST log in** with your Google account and allow access.

```powershell
gcloud auth application-default login
```

Once you have logged in, verify your project link:

```powershell
gcloud auth application-default set-quota-project mangalam-71d5c
```

## 🚀 THEN DEPLOY

After fixing the auth, simply run your deployment script:

```powershell
.\deploy.bat
```

This script handles everything:
1.  Building Backend (to Container Registry)
2.  Deploying Backend to `asia-south1`
3.  Building Frontend
4.  Deploying Frontend
5.  Linking them together

**Note:** If `.\deploy.bat` fails with "Forbidden" on the build step again, double-check that your Google Cloud Project `mangalam-71d5c` has a **Billing Account** linked in the GCP Console.
