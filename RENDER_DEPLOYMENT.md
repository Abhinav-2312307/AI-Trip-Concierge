# 🚀 Deploying AI Trip Concierge to Render

This guide outlines how to deploy the **AI Trip Concierge** full-stack application (FastAPI backend + Vite React frontend) onto Render with zero errors.

---

## ⚡ Method 1: 1-Click Render Blueprint (Recommended)

Render will automatically read [`render.yaml`](./render.yaml) and configure both the backend web service and the frontend static site with linked environment variables.

1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository (`AI-Trip-Concierge`).
5. Render will detect `render.yaml` and set up:
   - **Backend Web Service** (`ai-trip-concierge-api`)
   - **Frontend Static Site** (`ai-trip-concierge-web`)
6. (Optional) Provide your `GEMINI_API_KEY`, `GROQ_API_KEY`, or `ANTHROPIC_API_KEY` when prompted in the Render dashboard. *(The app also works in 100% offline zero-key mode without keys).*
7. Click **Apply**.

---

## 🛠️ Method 2: Manual Deployment via Render Dashboard

If you prefer setting up services individually in the Render UI:

### Step 1: Deploy Backend (Web Service)

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your repository.
3. Configure the following settings:
   - **Name**: `ai-trip-concierge-api`
   - **Region**: `Oregon (US West)` or nearest
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.8` | Recommended Python version |
   | `HOST` | `0.0.0.0` | Host binding |
   | `GEMINI_API_KEY` | *(Your Gemini Key)* | Optional: Free Google AI key |
   | `GROQ_API_KEY` | *(Your Groq Key)* | Optional: Free Groq key |
   | `ANTHROPIC_API_KEY` | *(Your Claude Key)* | Optional: Claude 3.5 Sonnet key |
5. Click **Create Web Service**. Copy your backend URL once deployed (e.g. `https://ai-trip-concierge-api.onrender.com`).

---

### Step 2: Deploy Frontend (Static Site)

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your repository.
3. Configure the following settings:
   - **Name**: `ai-trip-concierge-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://ai-trip-concierge-api.onrender.com` *(Replace with your actual backend URL)* |
5. Under **Redirects/Rewrites**:
   - Add a rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 🔍 Health Check & Validation

- **Backend Health Check**: Open `https://<your-backend-url>/api/health` — it should return:
  ```json
  {
    "status": "healthy",
    "service": "AI Trip Concierge Backend",
    "version": "3.0.0",
    "hotels_count": 6
  }
  ```
- **Frontend App**: Open `https://<your-frontend-url>` to explore your AI Trip Concierge live in production.
