# AmodXpress Courier Billing & Consignment Management System

A production-ready, enterprise-grade logistics billing console designed for **AmodXpress** to manage consignment dispatches, book sequential tracking numbers, compile revenue analytics, and fill custom PDF bill invoices at precise coordinates using `pdf-lib`.

---

## Key Features

- **Automated Workflows**: Auto-generates sequential Book & Consignment Numbers (starting from `1101`), gets current timestamps, and prints bills immediately.
- **Smart Logistics Calculations**: Automatically calculates Volumetric Cargo Weight (`L x W x H ÷ 5000`) and selects the maximum as the Chargeable Weight.
- **Zero-GST Policy compliance**: System does not reference, compute, or save tax inputs.
- **Google Sheets Database**: Service account synchronization logs dispatches sequentially. Has local JSON data store fallback for immediate development running.
- **PDF Overlay Service**: Automatically overlays booking details on the courier bill template and applies white-out overlays to erase GST tables and signatures.
- **Dashboard Metrics**: Compiles today's revenue, weights, shipment counts, and monthly earnings.
- **Exports & Prints**: Downloads flat files (CSV, Excel) and prints clean manifest summaries.
- **JWT Security**: Secures administrative screens with JWT cookies and rate-limiting guards.

---

## Quick Start (Run Locally)

Make sure you have [Node.js](https://nodejs.org/) installed (recommended version `v20` or higher).

1. Clone or extract this project folder to your local machine.
2. In the project root folder, install all workspace packages:
   ```bash
   npm run install:all
   ```
3. Boot both the React frontend and Express backend concurrently:
   ```bash
   npm run dev
   ```
4. Access the web console at: `http://localhost:5173`
   - Default Administrator Username: `admin`
   - Default Administrator Password: `admin123`

---

## Detailed Operations Guides

We have compiled structured walkthroughs inside the [docs/](file:///c:/Users/gaura/Desktop/amodxpress/docs/) directory:

1. 📂 **[Folder Structure & Project Architecture](file:///c:/Users/gaura/Desktop/amodxpress/docs/architecture.md)**: Details project design, code files, and future scaling capabilities.
2. 🚀 **[Installation & Run Guide](file:///c:/Users/gaura/Desktop/amodxpress/docs/installation.md)**: Prerequisites, local commands, and script options.
3. ⚙️ **[Environment Variables Config](file:///c:/Users/gaura/Desktop/amodxpress/docs/env-variables.md)**: Backend and frontend secrets documentation.
4. 📊 **[Google Sheets API Setup Guide](file:///c:/Users/gaura/Desktop/amodxpress/docs/google-sheets-setup.md)**: Cloud service account creation, credentials sharing, and setup.
5. 📍 **[PDF Coordinate Mapping Guide](file:///c:/Users/gaura/Desktop/amodxpress/docs/pdf-coordinate-mapping.md)**: Explains coordinates grid (x, y) mapping and the white-out masking boxes.
6. 🌐 **[Deployment Guide](file:///c:/Users/gaura/Desktop/amodxpress/docs/deployment.md)**: Host the backend on Railway/Render and frontend on Vercel.
