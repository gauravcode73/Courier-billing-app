# Google Sheets API Setup Guide

This guide explains how to set up a Google Spreadsheet to act as the database for the AmodXpress system, generate API service account keys, and share spreadsheet access.

---

## 1. Create a Google Cloud Project & Enable API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in using your Google Account, and create a new project named **AmodXpress Billing**.
3. In the sidebar menu, navigate to **APIs & Services** > **Library**.
4. Search for **Google Sheets API**, click on it, and click **Enable**.

---

## 2. Create a Service Account & Generate Key

1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top, and select **Service Account**.
3. Fill in the service account details:
   - **Name**: `amodxpress-sheets-sync`
   - **ID**: (will auto-generate)
4. Click **Create and Continue**, skip optional role selection, and click **Done**.
5. Locate the newly created account under the **Service Accounts** list. It looks like:
   `amodxpress-sheets-sync@your-project-id.iam.gserviceaccount.com`
   *Copy this email address; you will need it in the next section.*
6. Click the pencil icon (Edit) on the service account row.
7. Click the **Keys** tab at the top.
8. Click **Add Key** > **Create New Key**.
9. Select **JSON** format, and click **Create**.
10. A JSON credentials file will download to your computer. Save it securely.

---

## 3. Fill in the credentials inside `.env`

Open the downloaded JSON credentials file:
1. Locate the `"client_email"` field. Copy its value and paste it as `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `backend/.env`.
2. Locate the `"private_key"` field. Copy the entire block (including the newline characters `\n`) and paste it as `GOOGLE_PRIVATE_KEY` inside quotes:
   ```env
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6g...\\n-----END PRIVATE KEY-----\n"
   ```

---

## 4. Create and Share the Google Sheet

1. Open [Google Sheets](https://sheets.google.com) and create a new **Blank Spreadsheet**.
2. Name the spreadsheet (e.g. **AmodXpress Booking Register**).
3. Copy the **Spreadsheet ID** from the address bar. It is the long sequence of characters between `/d/` and `/edit`.
   - In `https://docs.google.com/spreadsheets/d/1XyZ9876abcdeFGHIJKLMNOPQRSTUVWXYZ/edit`, the ID is:
     `1XyZ9876abcdeFGHIJKLMNOPQRSTUVWXYZ`
4. Paste this ID as `GOOGLE_SPREADSHEET_ID` in `backend/.env`.
5. **CRITICAL STEP**: Click the **Share** button in the top right corner of your Google Sheet.
6. Under "Add people and groups", paste the **Service Account Email** you copied in Section 2, Step 5:
   `amodxpress-sheets-sync@your-project-id.iam.gserviceaccount.com`
7. Ensure the permission is set to **Editor**, uncheck "Notify people" if desired, and click **Share** or **Send**.
   *If you do not share write permissions, the backend server will return 403 Forbidden errors when appending bookings.*

---

## 5. Sheets Initialization

Our backend automatically checks the sheet headers on boot or upon the first booking request.
If the sheet is completely blank, the server automatically populates row `1` with the correct column header names:
`Book Number`, `Consignment Number`, `Date`, `Time`, `Booking Type`, `Booking Mode`, `Product Type`, etc.

You do **not** need to manually format or type headers in the sheet.
