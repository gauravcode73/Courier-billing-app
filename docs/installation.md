# Installation & Operational Guide

This document guides you through setting up and running the AmodXpress Courier Billing & Consignment Management System locally on a terminal.

---

## 1. Prerequisites

- **Node.js**: Recommended version `v20.x` or `v22.x` (LTS versions). Minimum `v18.x`.
- **npm**: Usually bundled with Node.js.
- **Git** (optional): For version control.

---

## 2. Command Line Installation

### Step 1: Install Dependencies
Open your command prompt or powershell in the root workspace folder (`c:\Users\gaura\Desktop\amodxpress`) and run:
```bash
npm run install:all
```
This single command runs `npm install` inside both the `backend/` and `frontend/` directories, and installs development utilities like `concurrently`.

### Step 2: Configure Environment Files
1. In the `backend/` folder, copy `.env.example` to `.env`.
2. Configure credentials (see the **[Environment Variables Config](env-variables.md)** guide for values).

### Step 3: Run the Application
Start both development servers concurrently:
```bash
npm run dev
```
Once run, you will see server outputs from both backend (running on port `5000`) and frontend (running on port `5173`).

- **Frontend URL**: `http://localhost:5173`
- **Backend Health Check**: `http://localhost:5000/health`

---

## 3. Dedicated Service Run Options

If you prefer to run services in separate shell windows:

### Run Backend Server Alone
```bash
cd backend
npm run dev
```

### Run Frontend Client Alone
```bash
cd frontend
npm run dev
```

### Generate the Mock PDF template explicitly
If you want to recreate the mock template PDF, run:
```bash
cd backend
npm run generate-pdf-template
```
*Note: The backend automatically runs this generator on startup if it detects that the template is missing.*

---

## 4. Production Build Instructions

Before hosting live:

1. Compile the React static SPA assets:
   ```bash
   cd frontend
   npm run build
   ```
   This generates compiled code inside `frontend/dist/`.

2. Transpile the Express backend Node server:
   ```bash
   cd backend
   npm run build
   ```
   This creates JavaScript files in `backend/dist/`.
