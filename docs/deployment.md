# Deployment Guide

This guide describes how to deploy the AmodXpress system to production environments.

---

## 1. Backend Deployment (Railway or Render)

The Node.js Express server can be hosted on platforms like [Railway](https://railway.app/) or [Render](https://render.com/).

### Standard Configs
- **Repository Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Settings**: Add the following secrets inside the hosting portal:
  - `PORT`: `5000` (or leave empty if the host injects its own port)
  - `NODE_ENV`: `production`
  - `JWT_SECRET`: (Generate a long random string)
  - `ADMIN_USERNAME`: `admin` (or update to your preferred admin handle)
  - `ADMIN_PASSWORD`: (Set a strong admin password)
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: (Paste your Google service account email)
  - `GOOGLE_PRIVATE_KEY`: (Paste the private key block *including* double-quotes and literal `\n` characters)
  - `GOOGLE_SPREADSHEET_ID`: (Your Google Sheet ID)

*Note: In Render or Railway, the service will start immediately after the build step completes. Ensure that `templates/courier_bill_template.pdf` is initialized. Our code automatically generates this fallback file if missing on startup.*

---

## 2. Frontend Deployment (Vercel)

The React SPA is hosted on [Vercel](https://vercel.com/) or Netlify.

### Standard Configs
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Settings**:
  - `VITE_API_URL`: The URL of your deployed backend service (e.g. `https://amodxpress-api.railway.app/api`).
  *Make sure this points to the live server, ending in `/api` and has no trailing slash.*

---

## 3. Production CORS Considerations

In `backend/src/server.ts`, we set CORS origin to `*` for convenience.
For production deployments:
1. Locate the CORS block in `backend/src/server.ts`:
   ```typescript
   cors({
     origin: 'https://your-frontend-domain.vercel.app',
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   })
   ```
2. Replace `'*'` with your actual Vercel frontend domain to secure the API endpoints from external requests.
