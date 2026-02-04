# 🌐 Manual Deployment Guide (No Local CLI)

Since your local terminal permissions are blocked, you can deploy using the Google Cloud Console directly.

## Option 1: The GitHub Method (Easiest GUI)

If you have your code on GitHub, this is the best way.

1.  **Push your code** to a GitHub repository.
2.  Go to the [Google Cloud Run Console](https://console.cloud.google.com/run).
3.  Click **Create Service**.
4.  **Source**: Select **"Continuously deploy new revisions from a source repository"**.
5.  **Repo**: Connect your GitHub and select your repository.
6.  **Configuration**:
    *   **Source location**: `/` (Root)
    *   **Build Type**: Dockerfile
    *   **Dockerfile location**: `backend/Dockerfile` (For Backend)
7.  **Service Name**: `mangalam-backend`
8.  **Region**: `asia-south1`
9.  **Authentication**: Allow unauthenticated invocations (Check this).
10. **Environment Variables**:
    *   Expand **"Container, Networking, Security"**.
    *   Go to **Variables & Secrets** tab.
    *   Add the variables from your `deploy.bat` file (MONGO_URI, JWT_SECRET, etc).
11. Click **Create**.

*Repeat for Frontend (Service: `mangalam-frontend`, Dockerfile: `frontend/Dockerfile`).*

---

## Option 2: The Cloud Shell Method (Bypass Local Auth)

Google provides a computer *in your browser* that is already authorized.

1.  **Zip your project**: Compress your `mangalam` folder into `mangalam.zip`.
2.  Go to the [Google Cloud Console](https://console.cloud.google.com).
3.  Click the **Activate Cloud Shell** icon (>_) in the top right toolbar.
4.  **Upload** your zip file:
    *   Click the "Three Dots" menu in the Cloud Shell terminal -> **Upload**.
    *   Select `mangalam.zip`.
5.  **Unzip and Deploy**:
    Run these commands inside the browser terminal:
    ```bash
    unzip mangalam.zip
    cd mangalam
    chmod +x deploy.bat
    ./deploy.bat
    ```

**Why this works:** The Cloud Shell is essentially a specialized computer inside Google's network, so it doesn't have the "Quota Project" or "Auth" issues your local laptop has.
